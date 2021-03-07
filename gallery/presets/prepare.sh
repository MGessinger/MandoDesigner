#!/usr/bin/sh

if [ -z $1 ]; then
	echo "Must provide a filename!";
	exit;
fi

for i in $@; do
	sed -i "
		s|<svg.*<svg|<svg|;
		s|viewBox='[[:digit:][:space:]]*'|viewBox='50 0 1700 3300'|;
		s|</svg>\s*</svg>\s*|</svg>|;
		s|>[[:space:]]\+<|><|g;
	" $i;
done
