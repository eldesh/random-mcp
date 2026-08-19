
INSPECTOR_ENVS := dev prd
INSPECTOR_CONFIGS := $(addprefix inspector.,$(addsuffix .json,$(INSPECTOR_ENVS)))
INSPECTOR_TARGETS := $(addprefix inspector-,$(INSPECTOR_ENVS))

.DELETE_ON_ERROR:


.PHONY: all
all: $(INSPECTOR_TARGETS)

.PHONY: $(INSPECTOR_TARGETS)
$(INSPECTOR_TARGETS): inspector-%: inspector.%.json

inspector.dev.json: MCP_URL := http://localhost:8787/mcp
inspector.prd.json: MCP_URL := https://random-mcp.eldesh-tools.workers.dev/mcp

$(INSPECTOR_CONFIGS): inspector.%.json: inspector.json.in .%.vars
	umask 077; \
	tmp="$@.tmp"; \
	trap 'rm -f "$$tmp"' EXIT; \
	m4 \
		-DMCP_URL_VALUE='$(MCP_URL)' \
		$< > "$$tmp"; \
	mv "$$tmp" $@; \
	trap - EXIT

.PHONY: clean
clean:
	$(RM) $(INSPECTOR_CONFIGS)

