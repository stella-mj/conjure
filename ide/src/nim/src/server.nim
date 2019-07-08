import asyncdispatch, jester, os, strutils, json, re, times, parseutils
import util/main
import util/jsonify
import util/types
import util/init
import util/response


router mainRouter:
    get "/":
       resp readFile("/home/tom/conjure/ide/src/webview/ts/test.html")

    get re"/init/(.*)":
        let path = request.matches[0]

        var response: InitResponse

        # try:
        response = newInitResponse(path)
        # except:
        #     let e = getCurrentException()
        #     let msg = getCurrentExceptionMsg()
            
        #     echo msg

        #     resp(Http200, [("Access-Control-Allow-Origin", "*")], ${"error":msg})

        resp(Http200, [("Access-Control-Allow-Origin", "*")], $(%response))
        # resp(Http200, [("Content-Type","text/css")] , "foo")

    get "/simpleDomains/@nodeId/@wantExpressions":
        resp(Http200, [("Access-Control-Allow-Origin", "*")], $(%loadSimpleDomains(@"nodeId", parseBool(@"wantExpressions"))))
        
    get "/prettyDomains/@nodeId/@wantExpressions/@paths?":
        resp(Http200, [("Access-Control-Allow-Origin", "*")], $(%loadPrettyDomains(@"nodeId", @"paths", parseBool(@"wantExpressions"))))

    get "/loadNodes/@nodeId/@depth?":
        resp(Http200, [("Access-Control-Allow-Origin", "*")], $(%loadNodes(@"nodeId", @"depth")))

    get "/loadAncestors/@nodeId":
        resp(Http200, [("Access-Control-Allow-Origin", "*")], $(%loadAncestors(@"nodeId")))

    get "/longestBranchingVariable":
        resp(Http200, [("Access-Control-Allow-Origin", "*")], getLongestBranchingVarName())

    get "/loadSet/@nodeId/@path":
        resp(Http200, [("Access-Control-Allow-Origin", "*")], $loadSetChild(@"nodeId",@"path"))




proc main() =
    
    var port : int
    if paramCount() == 0 :
        port = 5000
    else:
        port = paramStr(1).parseInt()

    let settings = newSettings(port=Port(port))
    var jester = initJester(mainRouter, settings=settings)
    jester.serve()

when isMainModule:
  main()