import type { ILoadBalancer } from '@spinnaker/core';

export interface ICloudrunLoadBalancer extends ILoadBalancer {
  credentials?: string;
  split?: ICloudrunTrafficSplit;
  migrateTraffic: boolean;
  dispatchRules?: ICloudrunDispatchRule[];
}

export interface ICloudrunTrafficSplit {
  allocations: { [serverGroupName: string]: number };
}

export interface ICloudrunDispatchRule {
  domain: string;
  path: string;
  service: string;
}
