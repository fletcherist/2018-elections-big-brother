let a = 1
let b = 1
for (let i = 0; i < 500; i++) {
  let c = a
  a = b
  b = a + c
  console.log(`${b} / ${a}`, b / a)
}
