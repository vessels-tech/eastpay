
PATH := node_modules/.bin:$(PATH)

PROJECT = "EAST_PAY"
dir = $(shell pwd)
include .ep_config
include /tmp/ep_env


# admin_dir := $(dir)/functions/src/admin
env_dir := $(dir)/env

#Add in admin node modules executable
PATH := $(admin_dir)/node_modules/.bin:$(PATH)

##
# Admin Tools
## 

admin-deploy-audio:
	@echo ${admin_dir}
	cd ${admin_dir} && gulp deploy_audio

admin-deploy-config:
	@echo ${admin_dir}
	cd ${admin_dir} && gulp deploy_config


##
# Env Setup
## 

env:
	# cat ${env_dir}/.env.${stage}.sh ${env_dir}/env.${stage}.sh > /tmp/ep_env

switch:
	@echo switching to stage: ${stage}
	@echo 'export stage=${stage}\n' > .ep_config
	@make env
	@firebase use ${stage}

switch-dev:
	make switch stage="development"

switch-prod:
	make switch stage="production"


##
# Local Development
##

build:
	cd $(dir)/functions; yarn run build
	# cp $(dir)/functions/src/index.js $(dir)/functions/lib/index.js

lint: 
	cd $(dir)/functions; yarn run lint

run-lt: 
	@make env
	@lt --subdomain ${LT_SUBDOMAIN} --port 5000

run-local:
	@make env
	./_run_local.sh

##
# Tests
##
test-unit:
	source ${env_dir}/env.unit.sh && \
		cd ${dir}/functions && \
		yarn run unit

test-service:
	source ${env_dir}/env.unit.sh && \
		cd ${dir}/functions && \
		yarn run service

##
# Deployment
##
deploy:
	# @make env lint build
	firebase deploy --only functions

deploy-public:
	# @make env lint build test-unit test-service
	@make env
	firebase deploy --only hosting


.PHONY: switch switch-dev swich-prod env