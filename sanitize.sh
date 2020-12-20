#!/usr/sh

if [ $# -lt 1 ]; then
	echo "Usage: sanitize FILE [SUFFIX]";
	exit;
fi
if [ ! -f $1 ]; then
	echo "Usage: sanitize FILE [SUFFIX]";
	exit;
fi

SERIF=$(grep "serif:" $1)
if [ ! -z $SERIF ]; then
	echo $SERIF;
	exit;
fi

sed -i -n '/<\/\?style\|{/ D; s/class="[^"]\+"\s//; p' $1
if [ ! -z $2 ]; then
	sed -i "s/_M/$2/" $1
fi
