export function onlyNumbers(value: string) {
  return value.replace(/\D/g, "")
}

export function maskPhone(value: string) {
  const numbers = onlyNumbers(value).slice(0, 11)

  if (numbers.length <= 2) return numbers
  if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`

  return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`
}

export function maskCep(value: string) {
  const numbers = onlyNumbers(value).slice(0, 8)

  if (numbers.length <= 5) return numbers

  return `${numbers.slice(0, 5)}-${numbers.slice(5)}`
}