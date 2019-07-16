import * as React from "react"
import * as ReactDOM from "react-dom"
import * as d3 from "d3"
import Node from "../modules/Node"
import {
  HierarchyPointLink,
  HierarchyPointNode,
  Selection,
  precisionFixed
} from "d3"
import { linkGenerator } from "../modules/TreeHelper"
import { isEqual, reduce, cloneDeep, reduceRight } from "lodash"
import { runInThisContext } from "vm"

type num2num = Record<number, { x: number; y: number }>

interface Props {
  diffParentId: number
  showLabels: boolean
  hash: string
  identifier: string
  width: number
  height: number
  rootNode: Node
  duration: number
  selected: number
  solAncestorIds: number[]
  solveable: boolean
  linScale: any
  minsize: number
  nodeClickHandler: (d: Node) => void
  storeNodePrevPos: (list: HierarchyPointNode<Node>[]) => void
}

interface State {
  oldPos: num2num
}

export default class TreeVis extends React.Component<Props, State> {
  // static whyDidYouRender = true
  zoom: any

  constructor(props: Props) {
    super(props)
    this.state = { oldPos: {} }

    console.log(this.props)
    this.zoom = d3
      .zoom<any, any>()
      .on("zoom", function() {
        d3.select(`#${props.identifier}thegroup`).attr(
          "transform",
          d3.event.transform
        )
      })
      .extent([[0, 0], [props.width, props.height]])
  }

  focusNode(node: HierarchyPointNode<Node>) {
    // const ratio = 1290 / 465.45
    // console.log("ratio, ", ratio)

    this.zoom.translateTo(
      d3
        .select(`#${this.props.identifier} svg`)
        .transition()
        .duration(this.props.duration),
      node.x,
      node.y
    )
  }

  hasHiddenChildren(d: HierarchyPointNode<Node>): boolean {
    return d.data.childCount !== (d.data.children ? d.data.children.length : 0)
  }

  hasOnlyExploredChildren(d: HierarchyPointNode<Node>): boolean {
    if (d.children || d.data.childCount === 0) {
      return false
    }

    if (this.props.solAncestorIds.includes(d.data.id)) {
      return false
    }

    for (let i = 0; i < d.data.descCount; i++) {
      if (!(d.data.id + i + 1 in this.state.oldPos)) {
        return false
      }
    }

    return true
  }

  getDecCountMessage(d: HierarchyPointNode<Node>): string {
    if (this.hasHiddenChildren(d)) {
      return d.data.descCount + " nodes below"
    }
    return ""
  }

  maybeFocus(d: HierarchyPointNode<Node>): void {
    if (d.data.id === this.props.selected) {
      this.focusNode(d)
    }
  }

  updateCircles(selector: any) {
    let circle = selector.select("circle")

    circle
      .transition()
      .duration(this.props.duration)
      .attr("r", (d: HierarchyPointNode<Node>) =>
        Node.getRadius(d, this.props.linScale, this.props.minsize)
      )

    circle.classed(
      "selected",
      (d: HierarchyPointNode<Node>) => d.data.id === this.props.selected
    )

    circle.classed("hasOthers", (d: HierarchyPointNode<Node>) =>
      this.hasHiddenChildren(d)
    )

    circle.classed(
      "red",
      (d: HierarchyPointNode<Node>) =>
        (!this.props.solAncestorIds.includes(d.data.id) ||
          !this.props.solveable) &&
        !this.hasOnlyExploredChildren(d)
    )

    circle.classed("explored", (d: HierarchyPointNode<Node>) =>
      this.hasOnlyExploredChildren(d)
    )

    circle.classed(
      "solution",
      (d: HierarchyPointNode<Node>) => d.data.isSolution
    )
  }

  getPrevPos = (d: HierarchyPointNode<Node>): { x: number; y: number } => {
    return this.state.oldPos[d.data.id]
      ? this.state.oldPos[d.data.id]
      : { x: -1, y: -1 }
  }

  getParentNode = (
    d: HierarchyPointNode<Node>,
    nodeList: HierarchyPointNode<Node>[]
  ) => {
    return nodeList.filter(k => k.data.id === d.parent!.data.id)[0]
  }

  getNode = (
    d: HierarchyPointNode<Node>,
    nodeList: HierarchyPointNode<Node>[]
  ) => {
    return nodeList.filter(k => k.data.id === d.data.id)[0]
  }

  drawTree() {
    const hierarchy = d3.hierarchy<Node>(this.props.rootNode)

    const sorted = hierarchy
      .descendants()
      .sort((a, b) => b.data.label.length - a.data.label.length)

    const maxRadius = this.props.linScale(this.props.rootNode.descCount)

    const maxWidth = this.props.showLabels
      ? sorted[0].data.label.length * 10
      : maxRadius * 1.5
    const maxHeight = this.props.showLabels ? maxRadius * 3 : maxRadius * 1.5

    const layout = d3.tree<Node>().nodeSize([maxWidth, maxHeight])
    const svg = d3.select(`#${this.props.identifier}thegroup`)
    const rootNode = layout(hierarchy)
    const nodeList = rootNode.descendants()

    let g = svg.selectAll("g.node")
    let node = g.data(nodeList, (d: any) => d.data.id)

    let nodeEnter = node
      .enter()
      .append("g")
      .attr("class", "node")
      .on("click", (d: HierarchyPointNode<Node>) => {
        this.props.nodeClickHandler(d.data)
      })

    nodeEnter
      .attr("transform", d => {
        let entering = d.parent
          ? `translate(${this.getPrevPos(d.parent).x},${
              this.getPrevPos(d.parent).y
            })`
          : ""

        return entering
      })
      .each(d => this.maybeFocus(d))
      .transition()
      .duration(this.props.duration)
      .attr("transform", d => `translate(${d.x},${d.y})`)

    nodeEnter.append("circle")

    nodeEnter
      .append("text")
      .style("fill-opacity", 1e-6)
      .attr("fill", "black")
      .attr("class", "decision")
      .attr("y", -maxHeight / 2)
      .attr("dy", ".35em")
      .attr("text-anchor", "middle")
      .text(d => {
        return this.props.showLabels ? d.data.label : ""
      })
      .transition()
      .duration(this.props.duration)
      .style("fill-opacity", 1)

    nodeEnter
      .append("text")
      .style("fill-opacity", 1e-6)
      .attr("y", d => {
        return 2 * Node.getRadius(d, this.props.linScale, this.props.minsize)
      })
      .attr("class", "decCount")
      .attr("dy", ".35em")
      .attr("text-anchor", "middle")
      .text(d => (this.props.showLabels ? this.getDecCountMessage(d) : ""))
      .transition()
      .duration(this.props.duration)
      .style("fill-opacity", 1)

    this.updateCircles(nodeEnter)

    const nodeUpdate = node.each(d => {
      this.maybeFocus(d)
    })

    nodeUpdate
      .transition()
      .duration(this.props.duration)
      .attr("transform", (d: HierarchyPointNode<Node>) => {
        return `translate(${d.x},${d.y})`
      })

    nodeUpdate
      .select("text.decCount")
      .attr("y", d => {
        return 2 * Node.getRadius(d, this.props.linScale, this.props.minsize)
      })
      .transition()
      .duration(this.props.duration)
      .text(d => (this.props.showLabels ? this.getDecCountMessage(d) : ""))
      .style("fill-opacity", d => (this.getDecCountMessage(d) === "" ? 0 : 1))

    nodeUpdate.select("text.decision").text(d => {
      return this.props.showLabels ? d.data.label : ""
    })

    this.updateCircles(nodeUpdate)

    const nodeExit = node.exit<HierarchyPointNode<Node>>()

    nodeExit
      .selectAll("text")
      .transition()
      .duration(this.props.duration)
      .style("fill-opacity", 1e-6)

    nodeExit
      .select("circle")
      .transition()
      .duration(this.props.duration)
      .attr("r", 0)

    nodeExit
      .transition()
      .duration(this.props.duration)
      .attr("transform", d => {
        let parent = this.getParentNode(d, nodeList)
        parent = parent ? parent : d.parent!

        let exiting = `translate(${parent.x},${parent.y})`
        return exiting
      })
      .remove()

    let p = svg.selectAll("path.link")

    const linkList = rootNode.links()
    let link = p.data(linkList, (d: any) => d.target.data.id)

    const enterLink = link
      .enter()
      .insert("svg:path", "g")
      .classed("link", true)
      .classed("red", d => {
        return (
          !this.props.solAncestorIds.includes(d.target.data.id) ||
          !this.props.solveable
        )
      })
      .classed(
        "different",
        d =>
          // this.props.diffParentIds.includes(d.source.data.id) &&
          // d.target.data.id === d.source.data.id + 1
          d.target.data.id === d.source.data.id + 1 &&
          d.source.data.id === this.props.diffParentId
      )
      .attr("d", d => {
        const origin = {
          x: this.getPrevPos(d.source).x,
          y: this.getPrevPos(d.source).y
        }
        return linkGenerator({ source: origin, target: origin })
      })
      .style("stroke-opacity", 0)
      .transition()
      .duration(this.props.duration)
      .style("stroke-opacity", 1)
      .attr("d", linkGenerator)

    link
      .classed("red", d => {
        return (
          !this.props.solAncestorIds.includes(d.target.data.id) ||
          !this.props.solveable
        )
      })
      .classed(
        "different",
        d =>
          d.target.data.id === d.source.data.id + 1 &&
          d.source.data.id === this.props.diffParentId
        // this.props.diffParentIds.includes(d.source.data.id) &&
        // d.target.data.id === d.source.data.id + 1
      )
      .transition()
      .duration(this.props.duration)
      .attr("d", linkGenerator)
      .style("stroke-opacity", 1)

    link
      .exit<HierarchyPointLink<Node>>()
      .transition()
      .duration(this.props.duration)
      .style("stroke-opacity", 0)
      .attr("d", d => {
        let current = this.getNode(d.source, nodeList)

        current = current ? current : d.source

        const origin = { x: current.x, y: current.y }
        return linkGenerator({ source: origin, target: origin })
      })
      .remove()

    this.setState((prevState: State) => {
      let newMap = cloneDeep(prevState.oldPos)
      nodeList.forEach(d => {
        if (!newMap[d.data.id]) {
          newMap[d.data.id] = { x: -1, y: -1 }
        }

        newMap[d.data.id].x = d.x
        newMap[d.data.id].y = d.y
      })
      return { oldPos: newMap }
    })
  }

  makeGroup() {
    d3.select(`#${this.props.identifier} svg`)
      .call(this.zoom)
      .append("g")
      .attr("id", `${this.props.identifier}thegroup`)
  }

  componentDidMount() {
    this.makeGroup()
    this.drawTree()
    this.drawTree()
  }

  componentDidUpdate(prevProps: Props) {
    if (
      prevProps.selected !== this.props.selected ||
      !isEqual(prevProps.rootNode, this.props.rootNode) ||
      prevProps.showLabels !== this.props.showLabels
    ) {
      this.drawTree()
    }
  }

  render() {
    return (
      <div id={this.props.identifier} className="svg-container">
        <svg
          id="treeSVG"
          preserveAspectRatio="xMidYMid slice"
          viewBox={`0 0 ${this.props.width} ${this.props.height}`}
        ></svg>
      </div>
    )
  }
}