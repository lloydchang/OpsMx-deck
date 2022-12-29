import type { IComponentOptions, IController } from 'angular';
import { module } from 'angular';
import { uniq } from 'lodash';

import type { Application } from '@spinnaker/core';
import { AppListExtractor, StageConstants } from '@spinnaker/core';

import type { ICloudrunAllocationDescription } from '../../loadBalancerTransformer';

class CloudrunStageAllocationLabelCtrl implements IController {
  public inputViewValue: string;
  private allocationDescription: ICloudrunAllocationDescription;

  private static mapTargetCoordinateToLabel(targetCoordinate: string): string {
    const target = StageConstants.TARGET_LIST.find((t) => t.val === targetCoordinate);
    if (target) {
      return target.label;
    } else {
      return null;
    }
  }

  public $doCheck(): void {
    this.setInputViewValue();
  }

  private setInputViewValue(): void {
    if (this.allocationDescription.cluster && this.allocationDescription.target) {
      const targetLabel = CloudrunStageAllocationLabelCtrl.mapTargetCoordinateToLabel(
        this.allocationDescription.target,
      );
      this.inputViewValue = `${targetLabel} (${this.allocationDescription.cluster})`;
    } else {
      this.inputViewValue = null;
    }
  }
}

const cloudrunStageAllocationLabel: IComponentOptions = {
  bindings: { allocationDescription: '<' },
  controller: CloudrunStageAllocationLabelCtrl,
  template: `<input ng-model="$ctrl.inputViewValue" type="text" class="form-control input-sm" readonly/>`,
};

class CloudrunStageAllocationConfigurationRowCtrl implements IController {
  public allocationDescription: ICloudrunAllocationDescription;
  public serverGroupOptions: string[];
  public targets = StageConstants.TARGET_LIST;
  public clusterList: string[];
  public onAllocationChange: Function;
  private application: Application;
  private region: string;
  private account: string;

  public $onInit() {
    const clusterFilter = AppListExtractor.clusterFilterForCredentialsAndRegion(this.account, this.region);
    this.clusterList = AppListExtractor.getClusters([this.application], clusterFilter);
  }

  public getServerGroupOptions(): string[] {
    if (this.allocationDescription.serverGroupName) {
      return uniq(this.serverGroupOptions.concat(this.allocationDescription.serverGroupName));
    } else {
      return this.serverGroupOptions;
    }
  }
}

const cloudrunStageAllocationConfigurationRow: IComponentOptions = {
  bindings: {
    application: '<',
    region: '@',
    account: '@',
    allocationDescription: '<',
    removeAllocation: '&',
    serverGroupOptions: '<',
    onAllocationChange: '&',
  },
  controller: CloudrunStageAllocationConfigurationRowCtrl,
  templateUrl: require('./stageAllocationConfigurationRow.component.html'),
};

export const CLOUDRUN_STAGE_ALLOCATION_CONFIGURATION_ROW =
  'spinnaker.cloudrun.stageAllocationConfigurationRow.component';
module(CLOUDRUN_STAGE_ALLOCATION_CONFIGURATION_ROW, [])
  .component('cloudrunStageAllocationConfigurationRow', cloudrunStageAllocationConfigurationRow)
  .component('cloudrunStageAllocationLabel', cloudrunStageAllocationLabel);
