# Room assets

- The avatar and seven event photos are the existing portfolio's images, copied
  locally. They are not generated or substituted portraits/event scenes.
- `assets/portfolio/tcp1p-theme.png` is the original screenshot from
  https://github.com/TCP1P/tcp1p-theme/blob/main/image.png, used only in that project's entry.
- `assets/bali-night-window.png` is synthetic tropical night scenery generated
  with the built-in image generation tool during the approved design preview.
  It is not a photograph of Dimas' actual home or window view. The prompt requested
  a photographic-style tropical night landscape: distant misty Bali hills,
  coconut palm foliage, a desaturated blue-green sky, and understated moonlight,
  without a room, frame, people, text, or logos. It was copied unchanged from the
  approved design preview; no original portfolio photographs were regenerated.
- `assets/room-stills/` contains ten 2048px captures rendered from the shared scene.
- Furniture, trophies, books, gaming hardware, and the Quest 3/Touch Plus display
  are hand-modeled procedural Three.js geometry and canvas textures. They are
  representative illustrations, not scanned objects, official CAD assets, or
  verified replicas of the trophies awarded by each event. No Meta hardware art
  package or downloaded product model is included.
- Three.js is distributed under the included `three-license.txt`.

All content records and original photo sources are maintained in
`lib/portfolio-data.json`. The live scene and still generator use
`lib/room/scene/`; regenerate stills after changing visible room data or geometry.
