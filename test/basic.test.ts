import * as pull from 'pull-stream'
import { MeshNode } from '../src'

const createDuplex = (values: any[], cb: (err: pull.EndOrError, data: any) => void) => {
  return {
    source: pull.values(values),
    sink: pull.collect((err, results) => {
      cb(err, results)
    }),
  }
}

describe('basic', () => {
  it('onw node', (done) => {
    let count = 2
    const duplexOne = createDuplex([1, 2, 3], (err, results) => {
      expect(err).toBeFalsy()
      expect(results).toEqual(['a', 'b', 'c'])
      if (--count === 0) done()
    })

    const node = new MeshNode((_, destURI) => {
      if (destURI === 'Two') {
        const duplexTwo = createDuplex(['a', 'b', 'c'], (err, results) => {
          expect(err).toBeFalsy()
          expect(results).toEqual([1, 2, 3])
          if (--count === 0) done()
        })
        return {
          stream: duplexTwo,
        }
      }
    }, 'A')

    const portNum = node.createPortStream('One', 'Two')
    pull(portNum, duplexOne, portNum)
  })

  it('two nodes', (done) => {
    let count = 2
    const duplexOne = createDuplex([1, 2, 3], (err, results) => {
      expect(err).toBeFalsy()
      expect(results).toEqual(['a', 'b', 'c'])
      if (--count === 0) done()
    })

    const nodeA = new MeshNode('A')
    const nodeB = new MeshNode((_, destURI) => {
      if (destURI === 'Two') {
        const duplexTwo = createDuplex(['a', 'b', 'c'], (err, results) => {
          expect(err).toBeFalsy()
          expect(results).toEqual([1, 2, 3])
          if (--count === 0) done()
        })
        return {
          stream: duplexTwo,
        }
      }
    }, 'B')

    const a2b = nodeA.createRelayStream('A->B')
    const b2a = nodeB.createRelayStream('B->A')
    pull(a2b, b2a, a2b)

    const portNum = nodeA.createPortStream('One', 'Two')
    pull(portNum, duplexOne, portNum)
  })

  it('three nodes', (done) => {
    let count = 2
    const duplexOne = createDuplex([1, 2, 3], (err, results) => {
      expect(err).toBeFalsy()
      expect(results).toEqual(['a', 'b', 'c'])
      if (--count === 0) done()
    })

    const nodeA = new MeshNode('A')
    const nodeB = new MeshNode('B')
    const nodeC = new MeshNode((_, destURI) => {
      if (destURI === 'Two') {
        const duplexTwo = createDuplex(['a', 'b', 'c'], (err, results) => {
          expect(err).toBeFalsy()
          expect(results).toEqual([1, 2, 3])
          if (--count === 0) done()
        })
        return {
          stream: duplexTwo,
        }
      }
    }, 'B')

    const a2b = nodeA.createRelayStream('A->B')
    const b2a = nodeB.createRelayStream('B->A')
    pull(a2b, b2a, a2b)

    const b2c = nodeB.createRelayStream('B->C')
    const c2b = nodeC.createRelayStream('C->B')
    pull(b2c, c2b, b2c)

    const a2c = nodeA.createRelayStream('A->C')
    const c2a = nodeC.createRelayStream('C->A')
    pull(a2c, c2a, a2c)

    const portNum = nodeA.createPortStream('One', 'Two')
    pull(portNum, duplexOne, portNum)
  })
})
