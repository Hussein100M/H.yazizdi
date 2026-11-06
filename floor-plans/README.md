# Ground floor plan, brown presentation style

The white site plan redrawn in the brown kraft-paper style of the reference
plan: taupe paper, darker interior floors, white walls with drop shadows,
white line furniture, outline tree symbols, a title plaque and a north arrow.

- `ground-floor-brown-style.jpg`: with room numbers and a legend
- `ground-floor-brown-style-clean.jpg`: title and north arrow only

The room names in the legend are read from the furniture layout. Edit the
`ROOMS` list in `scripts/render.py` to rename or move them.

Regenerate (needs `opencv-python-headless`, `numpy`, `pillow`):

```bash
python3 scripts/render.py <white-plan.jpg> out.jpg scripts          # labeled
python3 scripts/render.py <white-plan.jpg> out-clean.jpg scripts clean
```
