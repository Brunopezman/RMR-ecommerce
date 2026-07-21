---
description: Borra todos los archivos de fase (fase*.md) en .opencode/command/
agent: general
---

Ejecutá el comando `/clear-commands` para limpiar los archivos de fase.

1. Borrá todos los archivos `fase*.md` del directorio `.opencode/command/`:
   ```bash
   rm .opencode/command/fase*.md
   ```

2. Verificá que solo quede `clear-commands.md`:
   ```bash
   ls .opencode/command/
   ```

3. Hacé commit si corresponde:
   ```bash
   git add .opencode/command/
   git commit -m "chore: limpiar archivos de fase completados"
   ```
