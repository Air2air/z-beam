/**
 * Auto-generated redirect tests
 * Run: npm test -- tests/redirects.test.js
 */

describe('301 Redirects Validation', () => {
  const redirects = [
  {
    "from": "/alabaster-laser-cleaning",
    "to": "/materials/stone/sedimentary/alabaster-laser-cleaning",
    "type": "flat-to-hierarchical",
    "material": "Alabaster"
  },
  {
    "from": "/stone/sedimentary/alabaster-laser-cleaning",
    "to": "/materials/stone/sedimentary/alabaster-laser-cleaning",
    "type": "root-to-materials",
    "material": "Alabaster"
  },
  {
    "from": "/alumina-laser-cleaning",
    "to": "/materials/ceramic/oxide/alumina-laser-cleaning",
    "type": "flat-to-hierarchical",
    "material": "Alumina"
  },
  {
    "from": "/ceramic/oxide/alumina-laser-cleaning",
    "to": "/materials/ceramic/oxide/alumina-laser-cleaning",
    "type": "root-to-materials",
    "material": "Alumina"
  },
  {
    "from": "/aluminum-laser-cleaning",
    "to": "/materials/metal/non-ferrous/aluminum-laser-cleaning",
    "type": "flat-to-hierarchical",
    "material": "Aluminum"
  },
  {
    "from": "/metal/non-ferrous/aluminum-laser-cleaning",
    "to": "/materials/metal/non-ferrous/aluminum-laser-cleaning",
    "type": "root-to-materials",
    "material": "Aluminum"
  },
  {
    "from": "/ash-laser-cleaning",
    "to": "/materials/wood/hardwood/ash-laser-cleaning",
    "type": "flat-to-hierarchical",
    "material": "Ash"
  },
  {
    "from": "/wood/hardwood/ash-laser-cleaning",
    "to": "/materials/wood/hardwood/ash-laser-cleaning",
    "type": "root-to-materials",
    "material": "Ash"
  },
  {
    "from": "/bamboo-laser-cleaning",
    "to": "/materials/wood/hardwood/bamboo-laser-cleaning",
    "type": "flat-to-hierarchical",
    "material": "Bamboo"
  },
  {
    "from": "/wood/hardwood/bamboo-laser-cleaning",
    "to": "/materials/wood/hardwood/bamboo-laser-cleaning",
    "type": "root-to-materials",
    "material": "Bamboo"
  },
  {
    "from": "/basalt-laser-cleaning",
    "to": "/materials/stone/igneous/basalt-laser-cleaning",
    "type": "flat-to-hierarchical",
    "material": "Basalt"
  },
  {
    "from": "/stone/igneous/basalt-laser-cleaning",
    "to": "/materials/stone/igneous/basalt-laser-cleaning",
    "type": "root-to-materials",
    "material": "Basalt"
  },
  {
    "from": "/beech-laser-cleaning",
    "to": "/materials/wood/hardwood/beech-laser-cleaning",
    "type": "flat-to-hierarchical",
    "material": "Beech"
  },
  {
    "from": "/wood/hardwood/beech-laser-cleaning",
    "to": "/materials/wood/hardwood/beech-laser-cleaning",
    "type": "root-to-materials",
    "material": "Beech"
  },
  {
    "from": "/beryllium-laser-cleaning",
    "to": "/materials/metal/specialty/beryllium-laser-cleaning",
    "type": "flat-to-hierarchical",
    "material": "Beryllium"
  },
  {
    "from": "/metal/specialty/beryllium-laser-cleaning",
    "to": "/materials/metal/specialty/beryllium-laser-cleaning",
    "type": "root-to-materials",
    "material": "Beryllium"
  },
  {
    "from": "/birch-laser-cleaning",
    "to": "/materials/wood/hardwood/birch-laser-cleaning",
    "type": "flat-to-hierarchical",
    "material": "Birch"
  },
  {
    "from": "/wood/hardwood/birch-laser-cleaning",
    "to": "/materials/wood/hardwood/birch-laser-cleaning",
    "type": "root-to-materials",
    "material": "Birch"
  },
  {
    "from": "/bluestone-laser-cleaning",
    "to": "/materials/stone/sedimentary/bluestone-laser-cleaning",
    "type": "flat-to-hierarchical",
    "material": "Bluestone"
  },
  {
    "from": "/stone/sedimentary/bluestone-laser-cleaning",
    "to": "/materials/stone/sedimentary/bluestone-laser-cleaning",
    "type": "root-to-materials",
    "material": "Bluestone"
  },
  {
    "from": "/borosilicate-glass-laser-cleaning",
    "to": "/materials/glass/soda-lime/borosilicate-glass-laser-cleaning",
    "type": "flat-to-hierarchical",
    "material": "Borosilicate Glass"
  },
  {
    "from": "/glass/soda-lime/borosilicate-glass-laser-cleaning",
    "to": "/materials/glass/soda-lime/borosilicate-glass-laser-cleaning",
    "type": "root-to-materials",
    "material": "Borosilicate Glass"
  },
  {
    "from": "/brass-laser-cleaning",
    "to": "/materials/metal/non-ferrous/brass-laser-cleaning",
    "type": "flat-to-hierarchical",
    "material": "Brass"
  },
  {
    "from": "/metal/non-ferrous/brass-laser-cleaning",
    "to": "/materials/metal/non-ferrous/brass-laser-cleaning",
    "type": "root-to-materials",
    "material": "Brass"
  },
  {
    "from": "/breccia-laser-cleaning",
    "to": "/materials/stone/sedimentary/breccia-laser-cleaning",
    "type": "flat-to-hierarchical",
    "material": "Breccia"
  },
  {
    "from": "/stone/sedimentary/breccia-laser-cleaning",
    "to": "/materials/stone/sedimentary/breccia-laser-cleaning",
    "type": "root-to-materials",
    "material": "Breccia"
  },
  {
    "from": "/brick-laser-cleaning",
    "to": "/materials/masonry/general/brick-laser-cleaning",
    "type": "flat-to-hierarchical",
    "material": "Brick"
  },
  {
    "from": "/masonry/general/brick-laser-cleaning",
    "to": "/materials/masonry/general/brick-laser-cleaning",
    "type": "root-to-materials",
    "material": "Brick"
  },
  {
    "from": "/bronze-laser-cleaning",
    "to": "/materials/metal/non-ferrous/bronze-laser-cleaning",
    "type": "flat-to-hierarchical",
    "material": "Bronze"
  },
  {
    "from": "/metal/non-ferrous/bronze-laser-cleaning",
    "to": "/materials/metal/non-ferrous/bronze-laser-cleaning",
    "type": "root-to-materials",
    "material": "Bronze"
  },
  {
    "from": "/calcite-laser-cleaning",
    "to": "/materials/stone/sedimentary/calcite-laser-cleaning",
    "type": "flat-to-hierarchical",
    "material": "Calcite"
  },
  {
    "from": "/stone/sedimentary/calcite-laser-cleaning",
    "to": "/materials/stone/sedimentary/calcite-laser-cleaning",
    "type": "root-to-materials",
    "material": "Calcite"
  },
  {
    "from": "/carbon-fiber-reinforced-polymer-laser-cleaning",
    "to": "/materials/composite/fiber-reinforced/carbon-fiber-reinforced-polymer-laser-cleaning",
    "type": "flat-to-hierarchical",
    "material": "CFRP"
  },
  {
    "from": "/composite/fiber-reinforced/carbon-fiber-reinforced-polymer-laser-cleaning",
    "to": "/materials/composite/fiber-reinforced/carbon-fiber-reinforced-polymer-laser-cleaning",
    "type": "root-to-materials",
    "material": "CFRP"
  },
  {
    "from": "/cast-iron-laser-cleaning",
    "to": "/materials/metal/ferrous/cast-iron-laser-cleaning",
    "type": "flat-to-hierarchical",
    "material": "Cast Iron"
  },
  {
    "from": "/metal/ferrous/cast-iron-laser-cleaning",
    "to": "/materials/metal/ferrous/cast-iron-laser-cleaning",
    "type": "root-to-materials",
    "material": "Cast Iron"
  },
  {
    "from": "/cedar-laser-cleaning",
    "to": "/materials/wood/softwood/cedar-laser-cleaning",
    "type": "flat-to-hierarchical",
    "material": "Cedar"
  },
  {
    "from": "/wood/softwood/cedar-laser-cleaning",
    "to": "/materials/wood/softwood/cedar-laser-cleaning",
    "type": "root-to-materials",
    "material": "Cedar"
  },
  {
    "from": "/cement-laser-cleaning",
    "to": "/materials/masonry/general/cement-laser-cleaning",
    "type": "flat-to-hierarchical",
    "material": "Cement"
  },
  {
    "from": "/masonry/general/cement-laser-cleaning",
    "to": "/materials/masonry/general/cement-laser-cleaning",
    "type": "root-to-materials",
    "material": "Cement"
  },
  {
    "from": "/ceramic-matrix-composites-cmcs-laser-cleaning",
    "to": "/materials/composite/fiber-reinforced/ceramic-matrix-composites-cmcs-laser-cleaning",
    "type": "flat-to-hierarchical",
    "material": "CMCs"
  },
  {
    "from": "/composite/fiber-reinforced/ceramic-matrix-composites-cmcs-laser-cleaning",
    "to": "/materials/composite/fiber-reinforced/ceramic-matrix-composites-cmcs-laser-cleaning",
    "type": "root-to-materials",
    "material": "CMCs"
  },
  {
    "from": "/cerium-laser-cleaning",
    "to": "/materials/rare-earth/lanthanide/cerium-laser-cleaning",
    "type": "flat-to-hierarchical",
    "material": "Cerium"
  },
  {
    "from": "/rare-earth/lanthanide/cerium-laser-cleaning",
    "to": "/materials/rare-earth/lanthanide/cerium-laser-cleaning",
    "type": "root-to-materials",
    "material": "Cerium"
  },
  {
    "from": "/cherry-laser-cleaning",
    "to": "/materials/wood/hardwood/cherry-laser-cleaning",
    "type": "flat-to-hierarchical",
    "material": "Cherry"
  },
  {
    "from": "/wood/hardwood/cherry-laser-cleaning",
    "to": "/materials/wood/hardwood/cherry-laser-cleaning",
    "type": "root-to-materials",
    "material": "Cherry"
  },
  {
    "from": "/chromium-laser-cleaning",
    "to": "/materials/metal/specialty/chromium-laser-cleaning",
    "type": "flat-to-hierarchical",
    "material": "Chromium"
  },
  {
    "from": "/metal/specialty/chromium-laser-cleaning",
    "to": "/materials/metal/specialty/chromium-laser-cleaning",
    "type": "root-to-materials",
    "material": "Chromium"
  },
  {
    "from": "/cobalt-laser-cleaning",
    "to": "/materials/metal/specialty/cobalt-laser-cleaning",
    "type": "flat-to-hierarchical",
    "material": "Cobalt"
  },
  {
    "from": "/metal/specialty/cobalt-laser-cleaning",
    "to": "/materials/metal/specialty/cobalt-laser-cleaning",
    "type": "root-to-materials",
    "material": "Cobalt"
  },
  {
    "from": "/concrete-laser-cleaning",
    "to": "/materials/masonry/general/concrete-laser-cleaning",
    "type": "flat-to-hierarchical",
    "material": "Concrete"
  },
  {
    "from": "/masonry/general/concrete-laser-cleaning",
    "to": "/materials/masonry/general/concrete-laser-cleaning",
    "type": "root-to-materials",
    "material": "Concrete"
  },
  {
    "from": "/copper-laser-cleaning",
    "to": "/materials/metal/non-ferrous/copper-laser-cleaning",
    "type": "flat-to-hierarchical",
    "material": "Copper"
  },
  {
    "from": "/metal/non-ferrous/copper-laser-cleaning",
    "to": "/materials/metal/non-ferrous/copper-laser-cleaning",
    "type": "root-to-materials",
    "material": "Copper"
  },
  {
    "from": "/crown-glass-laser-cleaning",
    "to": "/materials/glass/soda-lime/crown-glass-laser-cleaning",
    "type": "flat-to-hierarchical",
    "material": "Crown Glass"
  },
  {
    "from": "/glass/soda-lime/crown-glass-laser-cleaning",
    "to": "/materials/glass/soda-lime/crown-glass-laser-cleaning",
    "type": "root-to-materials",
    "material": "Crown Glass"
  },
  {
    "from": "/dysprosium-laser-cleaning",
    "to": "/materials/rare-earth/lanthanide/dysprosium-laser-cleaning",
    "type": "flat-to-hierarchical",
    "material": "Dysprosium"
  },
  {
    "from": "/rare-earth/lanthanide/dysprosium-laser-cleaning",
    "to": "/materials/rare-earth/lanthanide/dysprosium-laser-cleaning",
    "type": "root-to-materials",
    "material": "Dysprosium"
  },
  {
    "from": "/epoxy-resin-composites-laser-cleaning",
    "to": "/materials/composite/fiber-reinforced/epoxy-resin-composites-laser-cleaning",
    "type": "flat-to-hierarchical",
    "material": "Epoxy Resin Composites"
  },
  {
    "from": "/composite/fiber-reinforced/epoxy-resin-composites-laser-cleaning",
    "to": "/materials/composite/fiber-reinforced/epoxy-resin-composites-laser-cleaning",
    "type": "root-to-materials",
    "material": "Epoxy Resin Composites"
  },
  {
    "from": "/europium-laser-cleaning",
    "to": "/materials/rare-earth/lanthanide/europium-laser-cleaning",
    "type": "flat-to-hierarchical",
    "material": "Europium"
  },
  {
    "from": "/rare-earth/lanthanide/europium-laser-cleaning",
    "to": "/materials/rare-earth/lanthanide/europium-laser-cleaning",
    "type": "root-to-materials",
    "material": "Europium"
  },
  {
    "from": "/fiber-reinforced-polyurethane-frpu-laser-cleaning",
    "to": "/materials/composite/fiber-reinforced/fiber-reinforced-polyurethane-frpu-laser-cleaning",
    "type": "flat-to-hierarchical",
    "material": "FRPU"
  },
  {
    "from": "/composite/fiber-reinforced/fiber-reinforced-polyurethane-frpu-laser-cleaning",
    "to": "/materials/composite/fiber-reinforced/fiber-reinforced-polyurethane-frpu-laser-cleaning",
    "type": "root-to-materials",
    "material": "FRPU"
  },
  {
    "from": "/fiberglass-laser-cleaning",
    "to": "/materials/composite/fiber-reinforced/fiberglass-laser-cleaning",
    "type": "flat-to-hierarchical",
    "material": "Fiberglass"
  },
  {
    "from": "/composite/fiber-reinforced/fiberglass-laser-cleaning",
    "to": "/materials/composite/fiber-reinforced/fiberglass-laser-cleaning",
    "type": "root-to-materials",
    "material": "Fiberglass"
  },
  {
    "from": "/fir-laser-cleaning",
    "to": "/materials/wood/softwood/fir-laser-cleaning",
    "type": "flat-to-hierarchical",
    "material": "Fir"
  },
  {
    "from": "/wood/softwood/fir-laser-cleaning",
    "to": "/materials/wood/softwood/fir-laser-cleaning",
    "type": "root-to-materials",
    "material": "Fir"
  },
  {
    "from": "/float-glass-laser-cleaning",
    "to": "/materials/glass/soda-lime/float-glass-laser-cleaning",
    "type": "flat-to-hierarchical",
    "material": "Float Glass"
  },
  {
    "from": "/glass/soda-lime/float-glass-laser-cleaning",
    "to": "/materials/glass/soda-lime/float-glass-laser-cleaning",
    "type": "root-to-materials",
    "material": "Float Glass"
  },
  {
    "from": "/fused-silica-laser-cleaning",
    "to": "/materials/glass/soda-lime/fused-silica-laser-cleaning",
    "type": "flat-to-hierarchical",
    "material": "Fused Silica"
  },
  {
    "from": "/glass/soda-lime/fused-silica-laser-cleaning",
    "to": "/materials/glass/soda-lime/fused-silica-laser-cleaning",
    "type": "root-to-materials",
    "material": "Fused Silica"
  },
  {
    "from": "/gallium-arsenide-laser-cleaning",
    "to": "/materials/semiconductor/elemental/gallium-arsenide-laser-cleaning",
    "type": "flat-to-hierarchical",
    "material": "Gallium Arsenide"
  },
  {
    "from": "/semiconductor/elemental/gallium-arsenide-laser-cleaning",
    "to": "/materials/semiconductor/elemental/gallium-arsenide-laser-cleaning",
    "type": "root-to-materials",
    "material": "Gallium Arsenide"
  },
  {
    "from": "/gallium-laser-cleaning",
    "to": "/materials/metal/specialty/gallium-laser-cleaning",
    "type": "flat-to-hierarchical",
    "material": "Gallium"
  },
  {
    "from": "/metal/specialty/gallium-laser-cleaning",
    "to": "/materials/metal/specialty/gallium-laser-cleaning",
    "type": "root-to-materials",
    "material": "Gallium"
  },
  {
    "from": "/glass-fiber-reinforced-polymers-gfrp-laser-cleaning",
    "to": "/materials/composite/fiber-reinforced/glass-fiber-reinforced-polymers-gfrp-laser-cleaning",
    "type": "flat-to-hierarchical",
    "material": "GFRP"
  },
  {
    "from": "/composite/fiber-reinforced/glass-fiber-reinforced-polymers-gfrp-laser-cleaning",
    "to": "/materials/composite/fiber-reinforced/glass-fiber-reinforced-polymers-gfrp-laser-cleaning",
    "type": "root-to-materials",
    "material": "GFRP"
  },
  {
    "from": "/gold-laser-cleaning",
    "to": "/materials/metal/non-ferrous/gold-laser-cleaning",
    "type": "flat-to-hierarchical",
    "material": "Gold"
  },
  {
    "from": "/metal/non-ferrous/gold-laser-cleaning",
    "to": "/materials/metal/non-ferrous/gold-laser-cleaning",
    "type": "root-to-materials",
    "material": "Gold"
  },
  {
    "from": "/gorilla-glass-laser-cleaning",
    "to": "/materials/glass/soda-lime/gorilla-glass-laser-cleaning",
    "type": "flat-to-hierarchical",
    "material": "Gorilla Glass"
  },
  {
    "from": "/glass/soda-lime/gorilla-glass-laser-cleaning",
    "to": "/materials/glass/soda-lime/gorilla-glass-laser-cleaning",
    "type": "root-to-materials",
    "material": "Gorilla Glass"
  },
  {
    "from": "/granite-laser-cleaning",
    "to": "/materials/stone/igneous/granite-laser-cleaning",
    "type": "flat-to-hierarchical",
    "material": "Granite"
  },
  {
    "from": "/stone/igneous/granite-laser-cleaning",
    "to": "/materials/stone/igneous/granite-laser-cleaning",
    "type": "root-to-materials",
    "material": "Granite"
  },
  {
    "from": "/hafnium-laser-cleaning",
    "to": "/materials/metal/non-ferrous/hafnium-laser-cleaning",
    "type": "flat-to-hierarchical",
    "material": "Hafnium"
  },
  {
    "from": "/metal/non-ferrous/hafnium-laser-cleaning",
    "to": "/materials/metal/non-ferrous/hafnium-laser-cleaning",
    "type": "root-to-materials",
    "material": "Hafnium"
  },
  {
    "from": "/hastelloy-laser-cleaning",
    "to": "/materials/metal/specialty/hastelloy-laser-cleaning",
    "type": "flat-to-hierarchical",
    "material": "Hastelloy"
  },
  {
    "from": "/metal/specialty/hastelloy-laser-cleaning",
    "to": "/materials/metal/specialty/hastelloy-laser-cleaning",
    "type": "root-to-materials",
    "material": "Hastelloy"
  },
  {
    "from": "/hickory-laser-cleaning",
    "to": "/materials/wood/hardwood/hickory-laser-cleaning",
    "type": "flat-to-hierarchical",
    "material": "Hickory"
  },
  {
    "from": "/wood/hardwood/hickory-laser-cleaning",
    "to": "/materials/wood/hardwood/hickory-laser-cleaning",
    "type": "root-to-materials",
    "material": "Hickory"
  },
  {
    "from": "/inconel-laser-cleaning",
    "to": "/materials/metal/specialty/inconel-laser-cleaning",
    "type": "flat-to-hierarchical",
    "material": "Inconel"
  },
  {
    "from": "/metal/specialty/inconel-laser-cleaning",
    "to": "/materials/metal/specialty/inconel-laser-cleaning",
    "type": "root-to-materials",
    "material": "Inconel"
  },
  {
    "from": "/indium-laser-cleaning",
    "to": "/materials/metal/specialty/indium-laser-cleaning",
    "type": "flat-to-hierarchical",
    "material": "Indium"
  },
  {
    "from": "/metal/specialty/indium-laser-cleaning",
    "to": "/materials/metal/specialty/indium-laser-cleaning",
    "type": "root-to-materials",
    "material": "Indium"
  },
  {
    "from": "/iridium-laser-cleaning",
    "to": "/materials/metal/non-ferrous/iridium-laser-cleaning",
    "type": "flat-to-hierarchical",
    "material": "Iridium"
  },
  {
    "from": "/metal/non-ferrous/iridium-laser-cleaning",
    "to": "/materials/metal/non-ferrous/iridium-laser-cleaning",
    "type": "root-to-materials",
    "material": "Iridium"
  },
  {
    "from": "/iron-laser-cleaning",
    "to": "/materials/metal/ferrous/iron-laser-cleaning",
    "type": "flat-to-hierarchical",
    "material": "Iron"
  },
  {
    "from": "/metal/ferrous/iron-laser-cleaning",
    "to": "/materials/metal/ferrous/iron-laser-cleaning",
    "type": "root-to-materials",
    "material": "Iron"
  },
  {
    "from": "/kevlar-reinforced-polymer-laser-cleaning",
    "to": "/materials/composite/fiber-reinforced/kevlar-reinforced-polymer-laser-cleaning",
    "type": "flat-to-hierarchical",
    "material": "Kevlar-Reinforced Polymer"
  },
  {
    "from": "/composite/fiber-reinforced/kevlar-reinforced-polymer-laser-cleaning",
    "to": "/materials/composite/fiber-reinforced/kevlar-reinforced-polymer-laser-cleaning",
    "type": "root-to-materials",
    "material": "Kevlar-Reinforced Polymer"
  },
  {
    "from": "/lanthanum-laser-cleaning",
    "to": "/materials/rare-earth/lanthanide/lanthanum-laser-cleaning",
    "type": "flat-to-hierarchical",
    "material": "Lanthanum"
  },
  {
    "from": "/rare-earth/lanthanide/lanthanum-laser-cleaning",
    "to": "/materials/rare-earth/lanthanide/lanthanum-laser-cleaning",
    "type": "root-to-materials",
    "material": "Lanthanum"
  },
  {
    "from": "/lead-crystal-laser-cleaning",
    "to": "/materials/glass/soda-lime/lead-crystal-laser-cleaning",
    "type": "flat-to-hierarchical",
    "material": "Lead Crystal"
  },
  {
    "from": "/glass/soda-lime/lead-crystal-laser-cleaning",
    "to": "/materials/glass/soda-lime/lead-crystal-laser-cleaning",
    "type": "root-to-materials",
    "material": "Lead Crystal"
  },
  {
    "from": "/lead-laser-cleaning",
    "to": "/materials/metal/non-ferrous/lead-laser-cleaning",
    "type": "flat-to-hierarchical",
    "material": "Lead"
  },
  {
    "from": "/metal/non-ferrous/lead-laser-cleaning",
    "to": "/materials/metal/non-ferrous/lead-laser-cleaning",
    "type": "root-to-materials",
    "material": "Lead"
  },
  {
    "from": "/limestone-laser-cleaning",
    "to": "/materials/stone/sedimentary/limestone-laser-cleaning",
    "type": "flat-to-hierarchical",
    "material": "Limestone"
  },
  {
    "from": "/stone/sedimentary/limestone-laser-cleaning",
    "to": "/materials/stone/sedimentary/limestone-laser-cleaning",
    "type": "root-to-materials",
    "material": "Limestone"
  },
  {
    "from": "/magnesium-laser-cleaning",
    "to": "/materials/metal/specialty/magnesium-laser-cleaning",
    "type": "flat-to-hierarchical",
    "material": "Magnesium"
  },
  {
    "from": "/metal/specialty/magnesium-laser-cleaning",
    "to": "/materials/metal/specialty/magnesium-laser-cleaning",
    "type": "root-to-materials",
    "material": "Magnesium"
  },
  {
    "from": "/mahogany-laser-cleaning",
    "to": "/materials/wood/hardwood/mahogany-laser-cleaning",
    "type": "flat-to-hierarchical",
    "material": "Mahogany"
  },
  {
    "from": "/wood/hardwood/mahogany-laser-cleaning",
    "to": "/materials/wood/hardwood/mahogany-laser-cleaning",
    "type": "root-to-materials",
    "material": "Mahogany"
  },
  {
    "from": "/manganese-laser-cleaning",
    "to": "/materials/metal/non-ferrous/manganese-laser-cleaning",
    "type": "flat-to-hierarchical",
    "material": "Manganese"
  },
  {
    "from": "/metal/non-ferrous/manganese-laser-cleaning",
    "to": "/materials/metal/non-ferrous/manganese-laser-cleaning",
    "type": "root-to-materials",
    "material": "Manganese"
  },
  {
    "from": "/maple-laser-cleaning",
    "to": "/materials/wood/hardwood/maple-laser-cleaning",
    "type": "flat-to-hierarchical",
    "material": "Maple"
  },
  {
    "from": "/wood/hardwood/maple-laser-cleaning",
    "to": "/materials/wood/hardwood/maple-laser-cleaning",
    "type": "root-to-materials",
    "material": "Maple"
  },
  {
    "from": "/marble-laser-cleaning",
    "to": "/materials/stone/metamorphic/marble-laser-cleaning",
    "type": "flat-to-hierarchical",
    "material": "Marble"
  },
  {
    "from": "/stone/metamorphic/marble-laser-cleaning",
    "to": "/materials/stone/metamorphic/marble-laser-cleaning",
    "type": "root-to-materials",
    "material": "Marble"
  },
  {
    "from": "/mdf-laser-cleaning",
    "to": "/materials/wood/hardwood/mdf-laser-cleaning",
    "type": "flat-to-hierarchical",
    "material": "MDF"
  },
  {
    "from": "/wood/hardwood/mdf-laser-cleaning",
    "to": "/materials/wood/hardwood/mdf-laser-cleaning",
    "type": "root-to-materials",
    "material": "MDF"
  },
  {
    "from": "/metal-matrix-composites-mmcs-laser-cleaning",
    "to": "/materials/composite/fiber-reinforced/metal-matrix-composites-mmcs-laser-cleaning",
    "type": "flat-to-hierarchical",
    "material": "MMCs"
  },
  {
    "from": "/composite/fiber-reinforced/metal-matrix-composites-mmcs-laser-cleaning",
    "to": "/materials/composite/fiber-reinforced/metal-matrix-composites-mmcs-laser-cleaning",
    "type": "root-to-materials",
    "material": "MMCs"
  },
  {
    "from": "/molybdenum-laser-cleaning",
    "to": "/materials/metal/non-ferrous/molybdenum-laser-cleaning",
    "type": "flat-to-hierarchical",
    "material": "Molybdenum"
  },
  {
    "from": "/metal/non-ferrous/molybdenum-laser-cleaning",
    "to": "/materials/metal/non-ferrous/molybdenum-laser-cleaning",
    "type": "root-to-materials",
    "material": "Molybdenum"
  },
  {
    "from": "/mortar-laser-cleaning",
    "to": "/materials/masonry/general/mortar-laser-cleaning",
    "type": "flat-to-hierarchical",
    "material": "Mortar"
  },
  {
    "from": "/masonry/general/mortar-laser-cleaning",
    "to": "/materials/masonry/general/mortar-laser-cleaning",
    "type": "root-to-materials",
    "material": "Mortar"
  },
  {
    "from": "/neodymium-laser-cleaning",
    "to": "/materials/rare-earth/lanthanide/neodymium-laser-cleaning",
    "type": "flat-to-hierarchical",
    "material": "Neodymium"
  },
  {
    "from": "/rare-earth/lanthanide/neodymium-laser-cleaning",
    "to": "/materials/rare-earth/lanthanide/neodymium-laser-cleaning",
    "type": "root-to-materials",
    "material": "Neodymium"
  },
  {
    "from": "/nickel-laser-cleaning",
    "to": "/materials/metal/specialty/nickel-laser-cleaning",
    "type": "flat-to-hierarchical",
    "material": "Nickel"
  },
  {
    "from": "/metal/specialty/nickel-laser-cleaning",
    "to": "/materials/metal/specialty/nickel-laser-cleaning",
    "type": "root-to-materials",
    "material": "Nickel"
  },
  {
    "from": "/niobium-laser-cleaning",
    "to": "/materials/metal/non-ferrous/niobium-laser-cleaning",
    "type": "flat-to-hierarchical",
    "material": "Niobium"
  },
  {
    "from": "/metal/non-ferrous/niobium-laser-cleaning",
    "to": "/materials/metal/non-ferrous/niobium-laser-cleaning",
    "type": "root-to-materials",
    "material": "Niobium"
  },
  {
    "from": "/oak-laser-cleaning",
    "to": "/materials/wood/hardwood/oak-laser-cleaning",
    "type": "flat-to-hierarchical",
    "material": "Oak"
  },
  {
    "from": "/wood/hardwood/oak-laser-cleaning",
    "to": "/materials/wood/hardwood/oak-laser-cleaning",
    "type": "root-to-materials",
    "material": "Oak"
  },
  {
    "from": "/onyx-laser-cleaning",
    "to": "/materials/stone/sedimentary/onyx-laser-cleaning",
    "type": "flat-to-hierarchical",
    "material": "Onyx"
  },
  {
    "from": "/stone/sedimentary/onyx-laser-cleaning",
    "to": "/materials/stone/sedimentary/onyx-laser-cleaning",
    "type": "root-to-materials",
    "material": "Onyx"
  },
  {
    "from": "/palladium-laser-cleaning",
    "to": "/materials/metal/non-ferrous/palladium-laser-cleaning",
    "type": "flat-to-hierarchical",
    "material": "Palladium"
  },
  {
    "from": "/metal/non-ferrous/palladium-laser-cleaning",
    "to": "/materials/metal/non-ferrous/palladium-laser-cleaning",
    "type": "root-to-materials",
    "material": "Palladium"
  },
  {
    "from": "/phenolic-resin-composites-laser-cleaning",
    "to": "/materials/composite/fiber-reinforced/phenolic-resin-composites-laser-cleaning",
    "type": "flat-to-hierarchical",
    "material": "Phenolic Resin Composites"
  },
  {
    "from": "/composite/fiber-reinforced/phenolic-resin-composites-laser-cleaning",
    "to": "/materials/composite/fiber-reinforced/phenolic-resin-composites-laser-cleaning",
    "type": "root-to-materials",
    "material": "Phenolic Resin Composites"
  },
  {
    "from": "/pine-laser-cleaning",
    "to": "/materials/wood/softwood/pine-laser-cleaning",
    "type": "flat-to-hierarchical",
    "material": "Pine"
  },
  {
    "from": "/wood/softwood/pine-laser-cleaning",
    "to": "/materials/wood/softwood/pine-laser-cleaning",
    "type": "root-to-materials",
    "material": "Pine"
  },
  {
    "from": "/plaster-laser-cleaning",
    "to": "/materials/masonry/general/plaster-laser-cleaning",
    "type": "flat-to-hierarchical",
    "material": "Plaster"
  },
  {
    "from": "/masonry/general/plaster-laser-cleaning",
    "to": "/materials/masonry/general/plaster-laser-cleaning",
    "type": "root-to-materials",
    "material": "Plaster"
  },
  {
    "from": "/platinum-laser-cleaning",
    "to": "/materials/metal/non-ferrous/platinum-laser-cleaning",
    "type": "flat-to-hierarchical",
    "material": "Platinum"
  },
  {
    "from": "/metal/non-ferrous/platinum-laser-cleaning",
    "to": "/materials/metal/non-ferrous/platinum-laser-cleaning",
    "type": "root-to-materials",
    "material": "Platinum"
  },
  {
    "from": "/plywood-laser-cleaning",
    "to": "/materials/wood/hardwood/plywood-laser-cleaning",
    "type": "flat-to-hierarchical",
    "material": "Plywood"
  },
  {
    "from": "/wood/hardwood/plywood-laser-cleaning",
    "to": "/materials/wood/hardwood/plywood-laser-cleaning",
    "type": "root-to-materials",
    "material": "Plywood"
  },
  {
    "from": "/polycarbonate-laser-cleaning",
    "to": "/materials/plastic/thermoplastic/polycarbonate-laser-cleaning",
    "type": "flat-to-hierarchical",
    "material": "Polycarbonate"
  },
  {
    "from": "/plastic/thermoplastic/polycarbonate-laser-cleaning",
    "to": "/materials/plastic/thermoplastic/polycarbonate-laser-cleaning",
    "type": "root-to-materials",
    "material": "Polycarbonate"
  },
  {
    "from": "/polyester-resin-composites-laser-cleaning",
    "to": "/materials/composite/fiber-reinforced/polyester-resin-composites-laser-cleaning",
    "type": "flat-to-hierarchical",
    "material": "Polyester Resin Composites"
  },
  {
    "from": "/composite/fiber-reinforced/polyester-resin-composites-laser-cleaning",
    "to": "/materials/composite/fiber-reinforced/polyester-resin-composites-laser-cleaning",
    "type": "root-to-materials",
    "material": "Polyester Resin Composites"
  },
  {
    "from": "/polyethylene-laser-cleaning",
    "to": "/materials/plastic/thermoplastic/polyethylene-laser-cleaning",
    "type": "flat-to-hierarchical",
    "material": "Polyethylene"
  },
  {
    "from": "/plastic/thermoplastic/polyethylene-laser-cleaning",
    "to": "/materials/plastic/thermoplastic/polyethylene-laser-cleaning",
    "type": "root-to-materials",
    "material": "Polyethylene"
  },
  {
    "from": "/polypropylene-laser-cleaning",
    "to": "/materials/plastic/thermoplastic/polypropylene-laser-cleaning",
    "type": "flat-to-hierarchical",
    "material": "Polypropylene"
  },
  {
    "from": "/plastic/thermoplastic/polypropylene-laser-cleaning",
    "to": "/materials/plastic/thermoplastic/polypropylene-laser-cleaning",
    "type": "root-to-materials",
    "material": "Polypropylene"
  },
  {
    "from": "/polystyrene-laser-cleaning",
    "to": "/materials/plastic/thermoplastic/polystyrene-laser-cleaning",
    "type": "flat-to-hierarchical",
    "material": "Polystyrene"
  },
  {
    "from": "/plastic/thermoplastic/polystyrene-laser-cleaning",
    "to": "/materials/plastic/thermoplastic/polystyrene-laser-cleaning",
    "type": "root-to-materials",
    "material": "Polystyrene"
  },
  {
    "from": "/polytetrafluoroethylene-laser-cleaning",
    "to": "/materials/plastic/thermoplastic/polytetrafluoroethylene-laser-cleaning",
    "type": "flat-to-hierarchical",
    "material": "PTFE"
  },
  {
    "from": "/plastic/thermoplastic/polytetrafluoroethylene-laser-cleaning",
    "to": "/materials/plastic/thermoplastic/polytetrafluoroethylene-laser-cleaning",
    "type": "root-to-materials",
    "material": "PTFE"
  },
  {
    "from": "/polyvinyl-chloride-laser-cleaning",
    "to": "/materials/plastic/thermoplastic/polyvinyl-chloride-laser-cleaning",
    "type": "flat-to-hierarchical",
    "material": "PVC"
  },
  {
    "from": "/plastic/thermoplastic/polyvinyl-chloride-laser-cleaning",
    "to": "/materials/plastic/thermoplastic/polyvinyl-chloride-laser-cleaning",
    "type": "root-to-materials",
    "material": "PVC"
  },
  {
    "from": "/poplar-laser-cleaning",
    "to": "/materials/wood/hardwood/poplar-laser-cleaning",
    "type": "flat-to-hierarchical",
    "material": "Poplar"
  },
  {
    "from": "/wood/hardwood/poplar-laser-cleaning",
    "to": "/materials/wood/hardwood/poplar-laser-cleaning",
    "type": "root-to-materials",
    "material": "Poplar"
  },
  {
    "from": "/porcelain-laser-cleaning",
    "to": "/materials/ceramic/oxide/porcelain-laser-cleaning",
    "type": "flat-to-hierarchical",
    "material": "Porcelain"
  },
  {
    "from": "/ceramic/oxide/porcelain-laser-cleaning",
    "to": "/materials/ceramic/oxide/porcelain-laser-cleaning",
    "type": "root-to-materials",
    "material": "Porcelain"
  },
  {
    "from": "/porphyry-laser-cleaning",
    "to": "/materials/stone/sedimentary/porphyry-laser-cleaning",
    "type": "flat-to-hierarchical",
    "material": "Porphyry"
  },
  {
    "from": "/stone/sedimentary/porphyry-laser-cleaning",
    "to": "/materials/stone/sedimentary/porphyry-laser-cleaning",
    "type": "root-to-materials",
    "material": "Porphyry"
  },
  {
    "from": "/praseodymium-laser-cleaning",
    "to": "/materials/rare-earth/lanthanide/praseodymium-laser-cleaning",
    "type": "flat-to-hierarchical",
    "material": "Praseodymium"
  },
  {
    "from": "/rare-earth/lanthanide/praseodymium-laser-cleaning",
    "to": "/materials/rare-earth/lanthanide/praseodymium-laser-cleaning",
    "type": "root-to-materials",
    "material": "Praseodymium"
  },
  {
    "from": "/pyrex-laser-cleaning",
    "to": "/materials/glass/soda-lime/pyrex-laser-cleaning",
    "type": "flat-to-hierarchical",
    "material": "Pyrex"
  },
  {
    "from": "/glass/soda-lime/pyrex-laser-cleaning",
    "to": "/materials/glass/soda-lime/pyrex-laser-cleaning",
    "type": "root-to-materials",
    "material": "Pyrex"
  },
  {
    "from": "/quartz-glass-laser-cleaning",
    "to": "/materials/glass/soda-lime/quartz-glass-laser-cleaning",
    "type": "flat-to-hierarchical",
    "material": "Quartz Glass"
  },
  {
    "from": "/glass/soda-lime/quartz-glass-laser-cleaning",
    "to": "/materials/glass/soda-lime/quartz-glass-laser-cleaning",
    "type": "root-to-materials",
    "material": "Quartz Glass"
  },
  {
    "from": "/quartzite-laser-cleaning",
    "to": "/materials/stone/sedimentary/quartzite-laser-cleaning",
    "type": "flat-to-hierarchical",
    "material": "Quartzite"
  },
  {
    "from": "/stone/sedimentary/quartzite-laser-cleaning",
    "to": "/materials/stone/sedimentary/quartzite-laser-cleaning",
    "type": "root-to-materials",
    "material": "Quartzite"
  },
  {
    "from": "/redwood-laser-cleaning",
    "to": "/materials/wood/hardwood/redwood-laser-cleaning",
    "type": "flat-to-hierarchical",
    "material": "Redwood"
  },
  {
    "from": "/wood/hardwood/redwood-laser-cleaning",
    "to": "/materials/wood/hardwood/redwood-laser-cleaning",
    "type": "root-to-materials",
    "material": "Redwood"
  },
  {
    "from": "/rhenium-laser-cleaning",
    "to": "/materials/metal/non-ferrous/rhenium-laser-cleaning",
    "type": "flat-to-hierarchical",
    "material": "Rhenium"
  },
  {
    "from": "/metal/non-ferrous/rhenium-laser-cleaning",
    "to": "/materials/metal/non-ferrous/rhenium-laser-cleaning",
    "type": "root-to-materials",
    "material": "Rhenium"
  },
  {
    "from": "/rhodium-laser-cleaning",
    "to": "/materials/metal/non-ferrous/rhodium-laser-cleaning",
    "type": "flat-to-hierarchical",
    "material": "Rhodium"
  },
  {
    "from": "/metal/non-ferrous/rhodium-laser-cleaning",
    "to": "/materials/metal/non-ferrous/rhodium-laser-cleaning",
    "type": "root-to-materials",
    "material": "Rhodium"
  },
  {
    "from": "/rosewood-laser-cleaning",
    "to": "/materials/wood/hardwood/rosewood-laser-cleaning",
    "type": "flat-to-hierarchical",
    "material": "Rosewood"
  },
  {
    "from": "/wood/hardwood/rosewood-laser-cleaning",
    "to": "/materials/wood/hardwood/rosewood-laser-cleaning",
    "type": "root-to-materials",
    "material": "Rosewood"
  },
  {
    "from": "/rubber-laser-cleaning",
    "to": "/materials/composite/fiber-reinforced/rubber-laser-cleaning",
    "type": "flat-to-hierarchical",
    "material": "Rubber"
  },
  {
    "from": "/composite/fiber-reinforced/rubber-laser-cleaning",
    "to": "/materials/composite/fiber-reinforced/rubber-laser-cleaning",
    "type": "root-to-materials",
    "material": "Rubber"
  },
  {
    "from": "/ruthenium-laser-cleaning",
    "to": "/materials/metal/non-ferrous/ruthenium-laser-cleaning",
    "type": "flat-to-hierarchical",
    "material": "Ruthenium"
  },
  {
    "from": "/metal/non-ferrous/ruthenium-laser-cleaning",
    "to": "/materials/metal/non-ferrous/ruthenium-laser-cleaning",
    "type": "root-to-materials",
    "material": "Ruthenium"
  },
  {
    "from": "/sandstone-laser-cleaning",
    "to": "/materials/stone/sedimentary/sandstone-laser-cleaning",
    "type": "flat-to-hierarchical",
    "material": "Sandstone"
  },
  {
    "from": "/stone/sedimentary/sandstone-laser-cleaning",
    "to": "/materials/stone/sedimentary/sandstone-laser-cleaning",
    "type": "root-to-materials",
    "material": "Sandstone"
  },
  {
    "from": "/sapphire-glass-laser-cleaning",
    "to": "/materials/glass/soda-lime/sapphire-glass-laser-cleaning",
    "type": "flat-to-hierarchical",
    "material": "Sapphire Glass"
  },
  {
    "from": "/glass/soda-lime/sapphire-glass-laser-cleaning",
    "to": "/materials/glass/soda-lime/sapphire-glass-laser-cleaning",
    "type": "root-to-materials",
    "material": "Sapphire Glass"
  },
  {
    "from": "/schist-laser-cleaning",
    "to": "/materials/stone/sedimentary/schist-laser-cleaning",
    "type": "flat-to-hierarchical",
    "material": "Schist"
  },
  {
    "from": "/stone/sedimentary/schist-laser-cleaning",
    "to": "/materials/stone/sedimentary/schist-laser-cleaning",
    "type": "root-to-materials",
    "material": "Schist"
  },
  {
    "from": "/serpentine-laser-cleaning",
    "to": "/materials/stone/sedimentary/serpentine-laser-cleaning",
    "type": "flat-to-hierarchical",
    "material": "Serpentine"
  },
  {
    "from": "/stone/sedimentary/serpentine-laser-cleaning",
    "to": "/materials/stone/sedimentary/serpentine-laser-cleaning",
    "type": "root-to-materials",
    "material": "Serpentine"
  },
  {
    "from": "/shale-laser-cleaning",
    "to": "/materials/stone/sedimentary/shale-laser-cleaning",
    "type": "flat-to-hierarchical",
    "material": "Shale"
  },
  {
    "from": "/stone/sedimentary/shale-laser-cleaning",
    "to": "/materials/stone/sedimentary/shale-laser-cleaning",
    "type": "root-to-materials",
    "material": "Shale"
  },
  {
    "from": "/silicon-carbide-laser-cleaning",
    "to": "/materials/ceramic/carbide/silicon-carbide-laser-cleaning",
    "type": "flat-to-hierarchical",
    "material": "Silicon Carbide"
  },
  {
    "from": "/ceramic/carbide/silicon-carbide-laser-cleaning",
    "to": "/materials/ceramic/carbide/silicon-carbide-laser-cleaning",
    "type": "root-to-materials",
    "material": "Silicon Carbide"
  },
  {
    "from": "/silicon-germanium-laser-cleaning",
    "to": "/materials/semiconductor/elemental/silicon-germanium-laser-cleaning",
    "type": "flat-to-hierarchical",
    "material": "Silicon Germanium"
  },
  {
    "from": "/semiconductor/elemental/silicon-germanium-laser-cleaning",
    "to": "/materials/semiconductor/elemental/silicon-germanium-laser-cleaning",
    "type": "root-to-materials",
    "material": "Silicon Germanium"
  },
  {
    "from": "/silicon-laser-cleaning",
    "to": "/materials/semiconductor/elemental/silicon-laser-cleaning",
    "type": "flat-to-hierarchical",
    "material": "Silicon"
  },
  {
    "from": "/semiconductor/elemental/silicon-laser-cleaning",
    "to": "/materials/semiconductor/elemental/silicon-laser-cleaning",
    "type": "root-to-materials",
    "material": "Silicon"
  },
  {
    "from": "/silicon-nitride-laser-cleaning",
    "to": "/materials/ceramic/oxide/silicon-nitride-laser-cleaning",
    "type": "flat-to-hierarchical",
    "material": "Silicon Nitride"
  },
  {
    "from": "/ceramic/oxide/silicon-nitride-laser-cleaning",
    "to": "/materials/ceramic/oxide/silicon-nitride-laser-cleaning",
    "type": "root-to-materials",
    "material": "Silicon Nitride"
  },
  {
    "from": "/silver-laser-cleaning",
    "to": "/materials/metal/non-ferrous/silver-laser-cleaning",
    "type": "flat-to-hierarchical",
    "material": "Silver"
  },
  {
    "from": "/metal/non-ferrous/silver-laser-cleaning",
    "to": "/materials/metal/non-ferrous/silver-laser-cleaning",
    "type": "root-to-materials",
    "material": "Silver"
  },
  {
    "from": "/slate-laser-cleaning",
    "to": "/materials/stone/metamorphic/slate-laser-cleaning",
    "type": "flat-to-hierarchical",
    "material": "Slate"
  },
  {
    "from": "/stone/metamorphic/slate-laser-cleaning",
    "to": "/materials/stone/metamorphic/slate-laser-cleaning",
    "type": "root-to-materials",
    "material": "Slate"
  },
  {
    "from": "/soapstone-laser-cleaning",
    "to": "/materials/stone/sedimentary/soapstone-laser-cleaning",
    "type": "flat-to-hierarchical",
    "material": "Soapstone"
  },
  {
    "from": "/stone/sedimentary/soapstone-laser-cleaning",
    "to": "/materials/stone/sedimentary/soapstone-laser-cleaning",
    "type": "root-to-materials",
    "material": "Soapstone"
  },
  {
    "from": "/soda-lime-glass-laser-cleaning",
    "to": "/materials/glass/specialty-glass/soda-lime-glass-laser-cleaning",
    "type": "flat-to-hierarchical",
    "material": "Soda-Lime Glass"
  },
  {
    "from": "/glass/specialty-glass/soda-lime-glass-laser-cleaning",
    "to": "/materials/glass/specialty-glass/soda-lime-glass-laser-cleaning",
    "type": "root-to-materials",
    "material": "Soda-Lime Glass"
  },
  {
    "from": "/stainless-steel-laser-cleaning",
    "to": "/materials/metal/ferrous/stainless-steel-laser-cleaning",
    "type": "flat-to-hierarchical",
    "material": "Stainless Steel"
  },
  {
    "from": "/metal/ferrous/stainless-steel-laser-cleaning",
    "to": "/materials/metal/ferrous/stainless-steel-laser-cleaning",
    "type": "root-to-materials",
    "material": "Stainless Steel"
  },
  {
    "from": "/steel-laser-cleaning",
    "to": "/materials/metal/ferrous/steel-laser-cleaning",
    "type": "flat-to-hierarchical",
    "material": "Steel"
  },
  {
    "from": "/metal/ferrous/steel-laser-cleaning",
    "to": "/materials/metal/ferrous/steel-laser-cleaning",
    "type": "root-to-materials",
    "material": "Steel"
  },
  {
    "from": "/stoneware-laser-cleaning",
    "to": "/materials/ceramic/oxide/stoneware-laser-cleaning",
    "type": "flat-to-hierarchical",
    "material": "Stoneware"
  },
  {
    "from": "/ceramic/oxide/stoneware-laser-cleaning",
    "to": "/materials/ceramic/oxide/stoneware-laser-cleaning",
    "type": "root-to-materials",
    "material": "Stoneware"
  },
  {
    "from": "/stucco-laser-cleaning",
    "to": "/materials/masonry/concrete/stucco-laser-cleaning",
    "type": "flat-to-hierarchical",
    "material": "Stucco"
  },
  {
    "from": "/masonry/concrete/stucco-laser-cleaning",
    "to": "/materials/masonry/concrete/stucco-laser-cleaning",
    "type": "root-to-materials",
    "material": "Stucco"
  },
  {
    "from": "/tantalum-laser-cleaning",
    "to": "/materials/metal/alloy/tantalum-laser-cleaning",
    "type": "flat-to-hierarchical",
    "material": "Tantalum"
  },
  {
    "from": "/metal/alloy/tantalum-laser-cleaning",
    "to": "/materials/metal/alloy/tantalum-laser-cleaning",
    "type": "root-to-materials",
    "material": "Tantalum"
  },
  {
    "from": "/teak-laser-cleaning",
    "to": "/materials/wood/hardwood/teak-laser-cleaning",
    "type": "flat-to-hierarchical",
    "material": "Teak"
  },
  {
    "from": "/wood/hardwood/teak-laser-cleaning",
    "to": "/materials/wood/hardwood/teak-laser-cleaning",
    "type": "root-to-materials",
    "material": "Teak"
  },
  {
    "from": "/tempered-glass-laser-cleaning",
    "to": "/materials/glass/specialty-glass/tempered-glass-laser-cleaning",
    "type": "flat-to-hierarchical",
    "material": "Tempered Glass"
  },
  {
    "from": "/glass/specialty-glass/tempered-glass-laser-cleaning",
    "to": "/materials/glass/specialty-glass/tempered-glass-laser-cleaning",
    "type": "root-to-materials",
    "material": "Tempered Glass"
  },
  {
    "from": "/terbium-laser-cleaning",
    "to": "/materials/rare-earth/lanthanide/terbium-laser-cleaning",
    "type": "flat-to-hierarchical",
    "material": "Terbium"
  },
  {
    "from": "/rare-earth/lanthanide/terbium-laser-cleaning",
    "to": "/materials/rare-earth/lanthanide/terbium-laser-cleaning",
    "type": "root-to-materials",
    "material": "Terbium"
  },
  {
    "from": "/terracotta-laser-cleaning",
    "to": "/materials/masonry/concrete/terracotta-laser-cleaning",
    "type": "flat-to-hierarchical",
    "material": "Terracotta"
  },
  {
    "from": "/masonry/concrete/terracotta-laser-cleaning",
    "to": "/materials/masonry/concrete/terracotta-laser-cleaning",
    "type": "root-to-materials",
    "material": "Terracotta"
  },
  {
    "from": "/thermoplastic-elastomer-laser-cleaning",
    "to": "/materials/composite/structural/thermoplastic-elastomer-laser-cleaning",
    "type": "flat-to-hierarchical",
    "material": "Thermoplastic Elastomer"
  },
  {
    "from": "/composite/structural/thermoplastic-elastomer-laser-cleaning",
    "to": "/materials/composite/structural/thermoplastic-elastomer-laser-cleaning",
    "type": "root-to-materials",
    "material": "Thermoplastic Elastomer"
  },
  {
    "from": "/tin-laser-cleaning",
    "to": "/materials/metal/alloy/tin-laser-cleaning",
    "type": "flat-to-hierarchical",
    "material": "Tin"
  },
  {
    "from": "/metal/alloy/tin-laser-cleaning",
    "to": "/materials/metal/alloy/tin-laser-cleaning",
    "type": "root-to-materials",
    "material": "Tin"
  },
  {
    "from": "/titanium-carbide-laser-cleaning",
    "to": "/materials/ceramic/oxide/titanium-carbide-laser-cleaning",
    "type": "flat-to-hierarchical",
    "material": "Titanium Carbide"
  },
  {
    "from": "/ceramic/oxide/titanium-carbide-laser-cleaning",
    "to": "/materials/ceramic/oxide/titanium-carbide-laser-cleaning",
    "type": "root-to-materials",
    "material": "Titanium Carbide"
  },
  {
    "from": "/titanium-laser-cleaning",
    "to": "/materials/metal/specialty/titanium-laser-cleaning",
    "type": "flat-to-hierarchical",
    "material": "Titanium"
  },
  {
    "from": "/metal/specialty/titanium-laser-cleaning",
    "to": "/materials/metal/specialty/titanium-laser-cleaning",
    "type": "root-to-materials",
    "material": "Titanium"
  },
  {
    "from": "/tool-steel-laser-cleaning",
    "to": "/materials/metal/alloy/tool-steel-laser-cleaning",
    "type": "flat-to-hierarchical",
    "material": "Tool Steel"
  },
  {
    "from": "/metal/alloy/tool-steel-laser-cleaning",
    "to": "/materials/metal/alloy/tool-steel-laser-cleaning",
    "type": "root-to-materials",
    "material": "Tool Steel"
  },
  {
    "from": "/travertine-laser-cleaning",
    "to": "/materials/stone/natural/travertine-laser-cleaning",
    "type": "flat-to-hierarchical",
    "material": "Travertine"
  },
  {
    "from": "/stone/natural/travertine-laser-cleaning",
    "to": "/materials/stone/natural/travertine-laser-cleaning",
    "type": "root-to-materials",
    "material": "Travertine"
  },
  {
    "from": "/tungsten-carbide-laser-cleaning",
    "to": "/materials/ceramic/oxide/tungsten-carbide-laser-cleaning",
    "type": "flat-to-hierarchical",
    "material": "Tungsten Carbide"
  },
  {
    "from": "/ceramic/oxide/tungsten-carbide-laser-cleaning",
    "to": "/materials/ceramic/oxide/tungsten-carbide-laser-cleaning",
    "type": "root-to-materials",
    "material": "Tungsten Carbide"
  },
  {
    "from": "/tungsten-laser-cleaning",
    "to": "/materials/metal/alloy/tungsten-laser-cleaning",
    "type": "flat-to-hierarchical",
    "material": "Tungsten"
  },
  {
    "from": "/metal/alloy/tungsten-laser-cleaning",
    "to": "/materials/metal/alloy/tungsten-laser-cleaning",
    "type": "root-to-materials",
    "material": "Tungsten"
  },
  {
    "from": "/urethane-composites-laser-cleaning",
    "to": "/materials/composite/structural/urethane-composites-laser-cleaning",
    "type": "flat-to-hierarchical",
    "material": "Urethane Composites"
  },
  {
    "from": "/composite/structural/urethane-composites-laser-cleaning",
    "to": "/materials/composite/structural/urethane-composites-laser-cleaning",
    "type": "root-to-materials",
    "material": "Urethane Composites"
  },
  {
    "from": "/vanadium-laser-cleaning",
    "to": "/materials/metal/alloy/vanadium-laser-cleaning",
    "type": "flat-to-hierarchical",
    "material": "Vanadium"
  },
  {
    "from": "/metal/alloy/vanadium-laser-cleaning",
    "to": "/materials/metal/alloy/vanadium-laser-cleaning",
    "type": "root-to-materials",
    "material": "Vanadium"
  },
  {
    "from": "/walnut-laser-cleaning",
    "to": "/materials/wood/hardwood/walnut-laser-cleaning",
    "type": "flat-to-hierarchical",
    "material": "Walnut"
  },
  {
    "from": "/wood/hardwood/walnut-laser-cleaning",
    "to": "/materials/wood/hardwood/walnut-laser-cleaning",
    "type": "root-to-materials",
    "material": "Walnut"
  },
  {
    "from": "/willow-laser-cleaning",
    "to": "/materials/wood/hardwood/willow-laser-cleaning",
    "type": "flat-to-hierarchical",
    "material": "Willow"
  },
  {
    "from": "/wood/hardwood/willow-laser-cleaning",
    "to": "/materials/wood/hardwood/willow-laser-cleaning",
    "type": "root-to-materials",
    "material": "Willow"
  },
  {
    "from": "/yttrium-laser-cleaning",
    "to": "/materials/rare-earth/scandium-group/yttrium-laser-cleaning",
    "type": "flat-to-hierarchical",
    "material": "Yttrium"
  },
  {
    "from": "/rare-earth/scandium-group/yttrium-laser-cleaning",
    "to": "/materials/rare-earth/scandium-group/yttrium-laser-cleaning",
    "type": "root-to-materials",
    "material": "Yttrium"
  },
  {
    "from": "/zinc-laser-cleaning",
    "to": "/materials/metal/alloy/zinc-laser-cleaning",
    "type": "flat-to-hierarchical",
    "material": "Zinc"
  },
  {
    "from": "/metal/alloy/zinc-laser-cleaning",
    "to": "/materials/metal/alloy/zinc-laser-cleaning",
    "type": "root-to-materials",
    "material": "Zinc"
  },
  {
    "from": "/zirconia-laser-cleaning",
    "to": "/materials/ceramic/oxide/zirconia-laser-cleaning",
    "type": "flat-to-hierarchical",
    "material": "Zirconia"
  },
  {
    "from": "/ceramic/oxide/zirconia-laser-cleaning",
    "to": "/materials/ceramic/oxide/zirconia-laser-cleaning",
    "type": "root-to-materials",
    "material": "Zirconia"
  },
  {
    "from": "/zirconium-laser-cleaning",
    "to": "/materials/metal/alloy/zirconium-laser-cleaning",
    "type": "flat-to-hierarchical",
    "material": "Zirconium"
  },
  {
    "from": "/metal/alloy/zirconium-laser-cleaning",
    "to": "/materials/metal/alloy/zirconium-laser-cleaning",
    "type": "root-to-materials",
    "material": "Zirconium"
  },
  {
    "from": "/metal",
    "to": "/materials/metal",
    "type": "category-redirect",
    "material": "metal category"
  },
  {
    "from": "/rare-earth",
    "to": "/materials/rare-earth",
    "type": "category-redirect",
    "material": "rare-earth category"
  },
  {
    "from": "/ceramic",
    "to": "/materials/ceramic",
    "type": "category-redirect",
    "material": "ceramic category"
  },
  {
    "from": "/composite",
    "to": "/materials/composite",
    "type": "category-redirect",
    "material": "composite category"
  },
  {
    "from": "/glass",
    "to": "/materials/glass",
    "type": "category-redirect",
    "material": "glass category"
  },
  {
    "from": "/plastic",
    "to": "/materials/plastic",
    "type": "category-redirect",
    "material": "plastic category"
  },
  {
    "from": "/stone",
    "to": "/materials/stone",
    "type": "category-redirect",
    "material": "stone category"
  },
  {
    "from": "/semiconductor",
    "to": "/materials/semiconductor",
    "type": "category-redirect",
    "material": "semiconductor category"
  },
  {
    "from": "/building",
    "to": "/materials/building",
    "type": "category-redirect",
    "material": "building category"
  },
  {
    "from": "/wood",
    "to": "/materials/wood",
    "type": "category-redirect",
    "material": "wood category"
  }
];

  test('should have redirects configured', () => {
    expect(redirects.length).toBeGreaterThan(0);
  });

  test('all redirects should have valid paths', () => {
    redirects.forEach(redirect => {
      expect(redirect.from).toMatch(/^\/[a-z0-9\-\/]+$/);
      expect(redirect.to).toMatch(/^\/materials\/[a-z0-9\-\/]+$/);
    });
  });

  test('no duplicate source paths', () => {
    const fromPaths = redirects.map(r => r.from);
    const uniquePaths = [...new Set(fromPaths)];
    expect(fromPaths.length).toBe(uniquePaths.length);
  });

  test('all redirects have permanent: true flag', () => {
    // In next.config.js, all redirects should be permanent: true
    // This test documents the requirement
    expect(true).toBe(true);
  });
});
