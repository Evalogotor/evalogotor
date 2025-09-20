import re

class LogoToPython:
    def __init__(self):
        self.procedures = {}
        self.output = ["import turtle"]

    def translate(self, code):
        lines = code.strip().splitlines()
        i = 0
        while i < len(lines):
            line = lines[i].strip()
            if not line or line.startswith(";"):  # skip comments
                i += 1
                continue

            if line.startswith("to "):
                name, params, body, i = self._parse_procedure(lines, i)
                self.procedures[name] = (params, body)
                self._emit_procedure(name, params, body)
            else:
                self._emit_line(line)
                i += 1

        self.output.append("turtle.done()")
        return "\n".join(self.output)

    def _parse_procedure(self, lines, i):
        header = lines[i].strip().split()
        name = header[1]
        params = [p.lstrip(":") for p in header[2:]]
        body = []
        i += 1
        while i < len(lines) and lines[i].strip() != "end":
            body.append(lines[i].strip())
            i += 1
        return name, params, body, i + 1

    def _emit_procedure(self, name, params, body):
        self.output.append(f"\ndef {name}({', '.join(params)}):")
        for line in body:
            py = self._convert_command(line, indent="    ")
            self.output.extend(py)

    def _emit_line(self, line):
        self.output.extend(self._convert_command(line))

    def _convert_command(self, line, indent=""):
        # Expand Logo commands to Python turtle
        tokens = line.split()
        if not tokens:
            return []
        cmd, *args = tokens
        cmd = cmd.lower()

        mapping = {
            "fd": lambda a: f"turtle.forward({a})",
            "forward": lambda a: f"turtle.forward({a})",
            "bk": lambda a: f"turtle.backward({a})",
            "back": lambda a: f"turtle.backward({a})",
            "rt": lambda a: f"turtle.right({a})",
            "lt": lambda a: f"turtle.left({a})",
            "pu": lambda: "turtle.penup()",
            "pd": lambda: "turtle.pendown()",
            "print": lambda *a: f"print({' '.join(a)})",
        }

        if cmd == "repeat":
            count = args[0]
            block = " ".join(args[1:])
            block = re.sub(r"^\[|\]$", "", block).strip()
            lines = block.split(";")
            out = [f"{indent}for _ in range(int({count})):"]
            for sub in block.split(" "):
                if sub:
                    out.extend(self._convert_command(sub, indent + "    "))
            return out

        elif cmd in mapping:
            return [indent + mapping[cmd](*args)]

        elif cmd in self.procedures:
            return [indent + f"{cmd}({', '.join(args)})"]

        else:
            return [indent + f"# Unknown: {line}"]

# Example usage
logo_code = """
to square :size
  repeat 4 [fd :size rt 90]
end

square 100
"""

translator = LogoToPython()
python_code = translator.translate(logo_code)
print(python_code)
