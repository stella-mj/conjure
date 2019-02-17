import types, setUtils/marker, setUtils/flags, setUtils/common
import re, strutils, os, tables, json, db_sqlite, parseutils 

proc parseFlags(db: DbConn, s, parent: Set, outerSetName, nodeId: string, ancestors: seq[int])
proc parseMarker(db: DbConn, s, parent: Set, outerSetName, nodeId: string, ancestors: seq[int])
proc parseOccurrence(db: DbConn, s, parent: Set, outerSetName, nodeId: string, ancestors: seq[int])
proc parseDummy(db: DbConn, s, parent: Set, outerSetName, nodeId: string, ancestors: seq[int])
proc parseExplicit(db: DbConn, s, parent: Set, outerSetName, nodeId: string, ancestors: seq[int])

proc decideSet*(db: DbConn, s,  parent: Set, outerSetName, nodeId: string, ancestors: seq[int]) =
    if s of FlagSet:
        parseFlags(db, s, parent, outerSetName, nodeId, ancestors)
    if s of MarkerSet:
        parseMarker(db, s, parent, outerSetName, nodeId, ancestors)
    if s of OccurrenceSet:
        parseOccurrence(db, s, parent, outerSetName, nodeId, ancestors)
    if s of DummySet:
        parseDummy(db, s, parent, outerSetName, nodeId, ancestors)
    if s of ExplicitSet:
        parseExplicit(db, s, parent, outerSetName, nodeId, ancestors)


proc parseDummy(db: DbConn, s, parent: Set, outerSetName, nodeId: string, ancestors: seq[int]) =
    let d = cast[DummySet](s)
    var query = getInnerSetQuery(d, parent, ancestors, outerSetName)

    for res in db.fastRows(sql(query), nodeId):

        var number : int
        discard res[1].parseInt(number)
        if number != d.dummyVal:
            d.included.add(number)
        else:
            d.excludedCount.inc()

proc parseOccurrence(db: DbConn, s, parent: Set, outerSetName, nodeId: string, ancestors: seq[int]) =
    var query = getInnerSetQuery(s, parent, ancestors, outerSetName)

    for res in db.fastRows(sql(query), nodeId):

        var number : int
        discard res[0].parseInt(number)

        if (res[1] == "1"):
            s.included.add(number)
        else:
            s.excluded.add(number)

proc parseExplicit(db: DbConn, s, parent: Set, outerSetName, nodeId: string, ancestors: seq[int]) =
    let e = cast[ExplicitSet](s)

    for setId in countUp(1, e.cardinality): 

        if (e.inner != nil):
            let childSet = makeChildSet(e, setID)
            var copy = ancestors
            copy.add(setId)
            decideSet(db, childSet, e, outerSetName, nodeId, copy)
        else:
            var query = getInnerSetQuery(e, parent, ancestors, outerSetName)
            for res in db.rows(sql(query), nodeId):
                var lower : int
                discard res[1].parseInt(lower)
                e.included.add(lower)
            break

proc parseFlags(db: DbConn, s, parent : Set, outerSetName, nodeId: string, ancestors: seq[int]) =

    var flagQuery = getFlagQuery(ancestors, outerSetName)
    var highestFlag = db.getValue(sql(flagQuery), nodeId)

    if highestFlag == "":
        highestFlag = "0"

    discard highestFlag.parseInt(s.markerLower)

    for setId in countUp(1, s.markerLower):

        if (s.inner != nil):
            let childSet = makeChildSet(s, setID)
            var copy = ancestors
            copy.add(setId)
            decideSet(db, childSet, s, outerSetName, nodeId, copy)
        else:
            let valuesQuery = getFlagValuesQuery(s, ancestors, outerSetName)
            includeValues(db, s, valuesQuery, nodeId)
            break;

proc parseMarker(db: DbConn, s, parent: Set, outerSetName, nodeId: string,  ancestors: seq[int]) =

    let markerQuery = getMarkerQuery(ancestors, outerSetName)
    var res = db.getRow(sql(markerQuery), nodeId)

    discard res[0].parseInt(s.markerLower)
    discard res[1].parseInt(s.markerUpper)
    
    for setId in countUp(1, s.markerLower): 

        if (s.inner != nil):
            let childSet = makeChildSet(s, setId)
            var copy = ancestors
            copy.add(setId)
            decideSet(db, childSet, s, outerSetName, nodeId, copy)
        else:
            let valuesQuery = getMarkerValuesQuery(ancestors, s.markerLower, outerSetName)
            includeValues(db, s, valuesQuery, nodeId)
            break;