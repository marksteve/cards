// @ts-nocheck

import { Play } from './Game'

const gt = (c1, c2) => {
  return Play.fromString(c1).value > Play.fromString(c2).value
}

test('singles', () => {
  expect(gt('2C', '9D')).toBeTruthy()
  expect(gt('3D', '3C')).toBeTruthy()
})

test('pairs', () => {
  expect(gt('2C 2D', '3S 3H')).toBeTruthy()
  expect(gt('9C 9D', '3S 3H')).toBeTruthy()
  expect(gt('3C 3D', '3S 3H')).toBeTruthy()
})

test('trio', () => {
  expect(gt('2C 2D 2S', '3S 3H 3D')).toBeTruthy()
  expect(gt('9C 9D 9H', '3S 3H 3D')).toBeTruthy()
})

test('straightFlush', () => {
  expect(gt('2D 3D 4D 5D 6D', 'AD 2D 3D 4D 5D')).toBeTruthy()
  expect(gt('3D 4D 5D 6D 7D', '2D 3D 4D 5D 6D')).toBeTruthy()
  // This time the high card is the Ace.
  expect(gt('AD KD QD JD TD', '9D TD JD QD KD')).toBeTruthy()
})

test('straight', () => {
  // The high card in these cases are not the ace or two.
  expect(gt('2C 3D 4D 5D 6D', 'AC 2D 3D 4D 5D')).toBeTruthy()
  expect(gt('3C 4D 5D 6D 7D', '2C 3D 4D 5D 6D')).toBeTruthy()
  // This time the high card is the Ace.
  expect(gt('AC KD QD JD TD', '9C TD JD QD KD')).toBeTruthy()
  // High card rank tied, break by suit.
  expect(gt('AS KH QH JH TH', 'AC KD QD JD TD')).toBeTruthy()
})

test('quadro', () => {
  expect(gt('9C 9S 9H 9D 4C', '3C 3S 3H 3D 2D')).toBeTruthy()
  expect(gt('KC KS KH KD TC', '9C 9S 9H 9D 4D')).toBeTruthy()
})

test('fullHouse', () => {
  expect(gt('9C 9S 9H 4D 4C', '3C 3S 3H 2C 2D')).toBeTruthy()
  expect(gt('4C 4S 4H TD TC', '3C 3S 3H 4C 4D')).toBeTruthy()
})

test('flush', () => {
  // Suit is more important than high card.
  expect(gt('9D KD 8D JD TD', 'AC 2C 3C 4C 6C')).toBeTruthy()
  // If suit is tied, then high card is used as breaker.
  expect(gt('9D 2D 3D 4D 6D', 'AD KD 8D JD TD')).toBeTruthy()
})

test('Invalid card combination', () =>
  expect(Play.fromString('3H 9H JC JH JD').value).toBe(0))

test('Invalid card combination', () =>
  expect(Play.fromString('9C 9H JS QS KC').value).toBe(0))

test('Invalid card combination', () =>
  expect(Play.fromString('6D 8D TS TH TD').value).toBe(0))
