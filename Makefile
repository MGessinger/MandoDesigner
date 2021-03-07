PRESETS=$(wildcard gallery/presets/*/*.svg)
MALE=images/Male-Body.svg images/Lower-Armor_M.svg images/Upper-Armor_M.svg
FEMALE=images/Female-Body.svg images/Lower-Armor_F.svg images/Upper-Armor_F.svg

serve: release
	php -S localhost:8000

release: gallery images

images: images/Helmets.svg $(MALE) $(FEMALE)

images/%_F.svg: data/pictures/%_F.svg
	@sed "/\/style/ {x; /css/ {d}; x}; /css/ { h; d;}; x; /css/ {h;d;}; x; s/\(class\|style\)=\"[^\"]\+\"\s//; s/_M/_F/" $< > $@;

images/%.svg: data/pictures/%.svg
	@sed "/\/style/ {x; /css/ {d}; x}; /css/ { h; d;}; x; /css/ {h;d;}; x; s/\(class\|style\)=\"[^\"]\+\"\s//;" $< > $@;

gallery: $(PRESETS)
	@echo $?;
	@sed -s -i " \
		s|<svg.*<svg|<svg|; \
		s|viewBox='[[:digit:][:space:]]*'|viewBox='50 0 1700 3300'|; \
		s|</svg>\s*</svg>\s*|</svg>|; \
		s|>[[:space:]]\+<|><|g; \
	" $?;
	@touch $@;
