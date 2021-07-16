#!/usr/bin/env bash

#
# Copyright (c) 2010-2019 Contributors to the openHAB project
#
# See the NOTICE file(s) distributed with this work for additional
# information.
#
# This program and the accompanying materials are made available under the
# terms of the Eclipse Public License 2.0 which is available at
# http://www.eclipse.org/legal/epl-2.0
#
# SPDX-License-Identifier: EPL-2.0
#

# Contributors:
#    Mehmet Arziman (home-iX) - initial contribution

set -e

KUBERNETES_NAMESPACE=openhab-cloud
KUBERNETES_ACCOUNT=openhabcloud

echo DEPLOYING OPENHAB-CLOUD TO KUBERNETES

# Creating the openHAB-cloud namespace

kubectl create namespace $KUBERNETES_NAMESPACE

# Creating a service account in the namespace

kubectl create serviceaccount $KUBERNETES_ACCOUNT --namespace $KUBERNETES_NAMESPACE

# Create needed configmaps before first use

kubectl create configmap openhabcloud-nginx-config --from-file=nginx_openhabcloud.conf --namespace $KUBERNETES_NAMESPACE
kubectl create -f openhabcloud_config_map.yml --namespace $KUBERNETES_NAMESPACE

### Create openHAB-cloud from template

echo Creating openHAB-cloud from template ...

# gcloud compute addresses create address-name --global

kubectl create -f openhabcloud_app.yml --namespace $KUBERNETES_NAMESPACE
kubectl create -f openhabcloud_certificate.yml --namespace $KUBERNETES_NAMESPACE
kubectl create -f openhabcloud_app_service.yml --namespace $KUBERNETES_NAMESPACE
kubectl create -f openhabcloud_app_ingress.yml --namespace $KUBERNETES_NAMESPACE
kubectl create -f openhabcloud_redis.yml --namespace $KUBERNETES_NAMESPACE
kubectl create -f openhabcloud_redis_service.yml --namespace $KUBERNETES_NAMESPACE
kubectl create -f openhabcloud_loadbalancer.yml --namespace $KUBERNETES_NAMESPACE

echo Creating openHAB-cloud from template ... done!

echo DEPLOYED OPENHAB-CLOUD TO KUBERNETES
