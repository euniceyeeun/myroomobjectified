# My Room, Objectified

## Object data

The map is display-only. Its records live in [`objects.json`](objects.json), with one record per object:

```json
{
  "id": "unique-object-id",
  "name": "Object name",
  "description": "Short description",
  "image": "assets/object-image.jpg",
  "sentimental": 50,
  "practical": 50
}
```

Set `sentimental` and `practical` to numbers from 0 to 10. Sentimental value maps left to right; practical value maps bottom to top. Put image files in `assets/` and set `image` to their path. The map reads `objects.json` when it opens.

For local development, serve this directory over HTTP (for example, `python3 -m http.server`) and open `map.html`.
