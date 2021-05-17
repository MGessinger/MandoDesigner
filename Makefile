release: gallery pictures


serve: release
	php -S 0.0.0.0:8000

clean:
	@rm -rf images;
	@rm gallery/wrapper_*.svg
	@rm -rf gallery/raw
.PHONY: clean

#=========================IMAGES==========================
LOGOS=images/LogoDark.svg images/LogoLight.svg

pictures: images/Helmets.svg images/Male_Master.svg $(LOGOS)
	@touch pictures

images:
	@mkdir -p images

images/%.svg: pictures/%.svg | images
	@sed " \
		s|\s\+class=.[^\"\']\+[\"\']||; \
		/Toggle/ { \
			s|_Toggle|\" class=\"toggle|; \
			s|Off|\" style=\"display:none|; \
		}; \
		s|_Option|\" class=\"option|; \
		/\"\(Helmet\|Chest\)_.[^_]\+\(_.\)\?\"/ { \
			s/ / class=\"invisible\" /; \
		} \
	" $< > $@;

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
			s|\s\+id=[\'\"][^\'\"]*[\'\"]||g; \
		" $*/$$i >> $@; done;
	@echo "</svg>" >> $@;

gallery/raw/%: gallery/male/% gallery/female/% | gallery/raw
	@sed -E -s -i " \
		/.<svg/ { s|.<svg|\n<svg|; D; }; \
		s|(</svg>\s*)+|</svg>|; \
		s|>\s+<|><|g; \
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
