MALE=images/Male-Body.svg images/Lower-Armor_M.svg images/Upper-Armor_M.svg
FEMALE=images/Female-Body.svg images/Lower-Armor_F.svg images/Upper-Armor_F.svg

serve: release
	php -S localhost:8000

release: gallery images

images: images/Helmets.svg $(MALE) $(FEMALE)

images/%_F.svg: data/pictures/%_F.svg
	@sed "/\/style/ {x; /css/ {d}; x}; /css/ { h; d;}; x; /css/ {h;d;}; x; s/\(class\|style\)=[\'\"][^\"\']\+[\"\']\s//; s/_M\(_\|\b\)/_F\1/" $< > $@;

images/%.svg: data/pictures/%.svg
	@sed "/\/style/ {x; /css/ {d}; x}; /css/ { h; d;}; x; /css/ {h;d;}; x; s/\(class\|style\)=[\'\"][^\"\']\+[\"\']\s//;" $< > $@;

gallery: gallery/wrapper_male.svg gallery/wrapper_female.svg
	@touch $@;

wrapper_%.svg: %/
	@echo $@;
	@echo "<?xml version='1.0' encoding='UTF-8' standalone='no'?><!DOCTYPE svg PUBLIC '-//W3C//DTD SVG 1.1//EN' 'http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd'><svg version='1.1' xmlns='http://www.w3.org/2000/svg'>" > $@;
	@for i in $?*; do \
		sed " \
			/^<svg/ { \
				s|^<svg[^>]*>|<g id='$$i'>\n|; \
				P; D; \
			}; \
			s|</svg>|</g>|; \
			s|[[:space:]]\+id=[\'\"][^\'\"]*[\'\"]||g; \
			s/<\(title\|style\)>[^<]*<\/\(title\|style\)>//g; \
		" $$i >> $@; done;
	@echo "</svg>" >> $@;

gallery/female: $(wildcard gallery/female/*.svg)
	@sed -E -s -i " \
		/.<svg/ { s|.<svg|\n<svg|; D; }; \
		s|(</svg>[[:space:]]*)+|</svg>|; \
		s|>[[:space:]]+<|><|g; \
		s/[[:space:]]*(width|height)='[[:digit:]]*'//g \
	" $?;

gallery/male: $(wildcard gallery/male/*.svg)
	@sed -E -s -i " \
		/.<svg/ { s|.<svg|\n<svg|; D; }; \
		s|(</svg>[[:space:]]*)+|</svg>|; \
		s|>[[:space:]]+<|><|g; \
		s/[[:space:]]*(width|height)='[[:digit:]]*'//g \
	" $?;
