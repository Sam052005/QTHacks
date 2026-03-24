import type { Node, Edge } from '@xyflow/react'

/**
 * Detects circuit type from a ReactFlow builder graph.
 */
export function detectCircuitFromGraph(nodes: Node[], edges: Edge[]): string {
  const ffNodes = nodes.filter(n =>
    n.type === 'dFlipFlop' || n.type === 'jkFlipFlop' || n.type === 'tFlipFlop'
  )
  const n = ffNodes.length

  if (n === 0) return 'Custom Circuit'

  // Build adjacency: ffId -> next ffId via Q output
  const qEdges = edges.filter(e => e.sourceHandle === 'q' || !e.sourceHandle)
  const adj: Record<string, string> = {}
  for (const edge of qEdges) {
    const srcFF = ffNodes.find(ff => ff.id === edge.source)
    const dstFF = ffNodes.find(ff => ff.id === edge.target)
    if (srcFF && dstFF) adj[srcFF.id] = dstFF.id
  }

  // Check for qbar feedback (Johnson)
  const qbarEdges = edges.filter(e => e.sourceHandle === 'qbar')
  const hasQbarFeedback = qbarEdges.some(e => {
    const srcFF = ffNodes.find(ff => ff.id === e.source)
    const dstFF = ffNodes.find(ff => ff.id === e.target)
    return srcFF && dstFF
  })

  // Check for Q feedback (Ring)
  const hasQFeedback = qEdges.some(e => {
    const src = ffNodes.find(ff => ff.id === e.source)
    const dst = ffNodes.find(ff => ff.id === e.target)
    if (!src || !dst) return false
    // Does the last FF feed back to the first?
    const outDegree = ffNodes.filter(ff => adj[ff.id]).length
    return outDegree === n // all connected in loop
  })

  // Check linear chain (Shift Register)
  const isLinear = (() => {
    let count = 0
    let current = ffNodes.find(ff => !Object.values(adj).includes(ff.id))?.id
    while (current && adj[current]) {
      current = adj[current]
      count++
    }
    return count === n - 1
  })()

  if (hasQbarFeedback && n >= 2) return `${n}-bit Johnson Counter`
  if (isLinear && n >= 2) return `${n}-bit Shift Register`
  if (hasQFeedback && n >= 2) return `${n}-bit Ring Counter`

  return `Custom ${n}-FF Circuit`
}
