MALE=images/Male-Body.svg images/Lower-Armor_M.svg images/Upper-Armor_M.svg
FEMALE=images/Female-Body.svg images/Lower-Armor_F.svg images/Upper-Armor_F.svg
NEUTRAL=images/BackgroundDark.svg images/BackgroundLight.svg images/Logo.svg images/Helmets.svg

release: gallery pictures

serve: release
	php -S localhost:8000

clean:
	@rm -rf images;
	@rm gallery/wrapper_*.svg
.PHONY: clean

#=========================IMAGES==========================

pictures: $(NEUTRAL) $(MALE) $(FEMALE)
	@touch pictures

images:
	@mkdir images

images/%_F.svg: pictures/%_F.svg | images
	@sed "s/[[:space:]]\+class=.[^\"\']\+[\"\']//; s/_M\(_\|\b\)/_F\1/" $< > $@;

images/%.svg: pictures/%.svg | images
	@sed "s/[[:space:]]\+class=.[^\"\']\+[\"\']//;" $< > $@;

#=========================GALLERY=========================

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
