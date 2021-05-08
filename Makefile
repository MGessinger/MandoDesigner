release: gallery pictures

serve: release
	php -S 0.0.0.0:8000

clean:
	@rm -rf images;
	@rm gallery/wrapper_*.svg
	@rm -rf gallery/raw
.PHONY: clean

#=========================IMAGES==========================

MALE=images/Male-Body.svg images/Lower-Armor_M.svg images/Upper-Armor_M.svg
FEMALE=images/Female-Body.svg images/Lower-Armor_F.svg images/Upper-Armor_F.svg
NEUTRAL=images/LogoDark.svg images/LogoLight.svg images/Helmets.svg

pictures: $(NEUTRAL) $(MALE) $(FEMALE)
	@touch pictures

images:
	@mkdir images

images/%_F.svg: pictures/%_F.svg | images
	@sed "s/[[:space:]]\+class=.[^\"\']\+[\"\']//; s/_M\([\"_]\)/_F\1/" $< > $@;

images/%.svg: pictures/%.svg | images
	@sed "s/[[:space:]]\+class=.[^\"\']\+[\"\']//;" $< > $@;

#=========================GALLERY=========================

MALE=$(wildcard gallery/male/*.svg)
FEMALE=$(wildcard gallery/female/*.svg)
RAW=$(patsubst gallery/male/%,gallery/raw/%,$(MALE))

gallery: $(RAW) gallery/wrapper_male.svg gallery/wrapper_female.svg
	@touch $@;

wrapper_%.svg: $(RAW)
	@echo $@;
	@echo "<?xml version='1.0' encoding='UTF-8' standalone='no'?><!DOCTYPE svg PUBLIC '-//W3C//DTD SVG 1.1//EN' 'http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd'><svg version='1.1' xmlns='http://www.w3.org/2000/svg'>" > $@;
	@for i in $(notdir $(wildcard $*/*)); do \
		sed " \
			/^<svg/ { \
				s|^<svg[^>]*>|<g id='$$i'>\n|; \
				P; D; \
			}; \
			s|</svg>|</g>|; \
			s|[[:space:]]\+id=[\'\"][^\'\"]*[\'\"]||g; \
		" $*/$$i >> $@; done;
	@echo "</svg>" >> $@;

gallery/raw/%: gallery/male/% gallery/female/% | gallery/raw
	@sed -E -s -i " \
		/.<svg/ { s|.<svg|\n<svg|; D; }; \
		s|(</svg>[[:space:]]*)+|</svg>|; \
		s|>[[:space:]]+<|><|g; \
		s/<(title|style)>[^<]*<\/(title|style)>//g; \
	" $?;
	@sed -E "\
		s/\s(d|width|height)=[\'\"][^\'\"]*[\'\"]//g; \
		s|<\w+\s*/>||g; \
		s|<\w+\s*>\s*</\w+>||g; \
		s/_(Toggle(Off)?|Option)//g; \
	" $< > $@;

gallery/raw:
	@mkdir -p $@;
