// Plain-text stdin format for C, C++ and Java programs (they can't take JSON args like solve() does).
// number/string -> as is, boolean -> 1/0, array of numbers -> "n" then one line of values,
// any other array -> "n" then each element encoded in order.
const encodeValue = (v) => {
  if (typeof v === 'boolean') return v ? '1' : '0'
  if (!Array.isArray(v)) return String(v)
  const flat = v.every((x) => typeof x === 'number')
  return flat ? `${v.length}\n${v.join(' ')}` : `${v.length}\n${v.map(encodeValue).join('\n')}`
}

export const encodeArgs = (args) => `${args.map(encodeValue).join('\n')}\n`

const comment = (example) => {
  if (!example) return ''
  try {
    const stdin = encodeArgs(JSON.parse(`[${example.input}]`)).trimEnd().split('\n')
    return [
      '// Read the input from stdin and print the answer as JSON (for example [0,1] or true).',
      '// Sample input:',
      ...stdin.map((l) => `//   ${l}`),
      `// Expected output: ${example.expected}`,
      '',
    ].join('\n')
  } catch {
    return ''
  }
}

export const nativeStarters = (example) => {
  const note = comment(example)
  return {
    c: `#include <stdio.h>\n\n${note}int main(void) {\n    // your code\n    return 0;\n}\n`,
    cpp: `#include <bits/stdc++.h>\nusing namespace std;\n\n${note}int main() {\n    // your code\n    return 0;\n}\n`,
    java: `import java.util.*;\n\n${note}public class Main {\n    public static void main(String[] args) {\n        Scanner in = new Scanner(System.in);\n        // your code\n    }\n}\n`,
  }
}
