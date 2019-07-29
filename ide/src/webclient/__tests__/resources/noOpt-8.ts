export const core = {
  nodes: [
    {
      id: 0,
      parentId: -1,
      label: "",
      prettyLabel: "",
      childCount: 1,
      isSolution: false,
      isLeftChild: true,
      descCount: 32
    },
    {
      id: 1,
      parentId: 0,
      label: "Root Propagation",
      prettyLabel: "Root Propagation",
      childCount: 1,
      isSolution: false,
      isLeftChild: true,
      descCount: 31
    },
    {
      id: 2,
      parentId: 1,
      label: "setA_Occurrence_00001 = 0",
      prettyLabel: "setA_Occurrence_00001 = 0",
      childCount: 2,
      isSolution: false,
      isLeftChild: true,
      descCount: 30
    },
    {
      id: 16,
      parentId: 2,
      label: "setA_Occurrence_00002 != 0",
      prettyLabel: "setA_Occurrence_00002 != 0",
      childCount: 2,
      isSolution: false,
      isLeftChild: false,
      descCount: 16
    },
    {
      id: 26,
      parentId: 16,
      label: "setA_Occurrence_00003 != 0",
      prettyLabel: "setA_Occurrence_00003 != 0",
      childCount: 1,
      isSolution: false,
      isLeftChild: false,
      descCount: 6
    },
    {
      id: 27,
      parentId: 26,
      label: "setA_Occurrence_00004 = 0",
      prettyLabel: "setA_Occurrence_00004 = 0",
      childCount: 2,
      isSolution: false,
      isLeftChild: true,
      descCount: 5
    },
    {
      id: 30,
      parentId: 27,
      label: "setA_Occurrence_00005 != 0",
      prettyLabel: "setA_Occurrence_00005 != 0",
      childCount: 1,
      isSolution: false,
      isLeftChild: false,
      descCount: 2
    },
    {
      id: 31,
      parentId: 30,
      label: "setA_Occurrence_00006 = 0",
      prettyLabel: "setA_Occurrence_00006 = 0",
      childCount: 1,
      isSolution: false,
      isLeftChild: true,
      descCount: 1
    },
    {
      id: 32,
      parentId: 31,
      label: "setA_Occurrence_00007 = 0",
      prettyLabel: "setA_Occurrence_00007 = 0",
      childCount: 0,
      isSolution: true,
      isLeftChild: true,
      descCount: 0
    },
    {
      id: 3,
      parentId: 2,
      label: "setA_Occurrence_00002 = 0",
      prettyLabel: "setA_Occurrence_00002 = 0",
      childCount: 2,
      isSolution: false,
      isLeftChild: true,
      descCount: 12
    },
    {
      id: 17,
      parentId: 16,
      label: "setA_Occurrence_00003 = 0",
      prettyLabel: "setA_Occurrence_00003 = 0",
      childCount: 2,
      isSolution: false,
      isLeftChild: true,
      descCount: 8
    },
    {
      id: 28,
      parentId: 27,
      label: "setA_Occurrence_00005 = 0",
      prettyLabel: "setA_Occurrence_00005 = 0",
      childCount: 1,
      isSolution: false,
      isLeftChild: true,
      descCount: 1
    }
  ],
  solAncestorIds: [0, 1, 2, 16, 26, 27, 30, 31, 32]
}