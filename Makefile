
modules := node_modules/@pageboard
packages := $(wildcard ./packages/*)
links := $(patsubst ./packages/%,$(modules)/%,$(packages))

all: $(modules) $(links) install

$(modules):
	mkdir -p $@

$(modules)/%: packages/%
	ln -s ../../$< $@

clean:
	rm $(modules)/*

install:
	# Do not forget to run prepare on development modules
	npm install --prod
	cd packages/pagecut/; npm install
	for mod in $(links); do cd $$mod; npm run postinstall; cd ../../..; done
