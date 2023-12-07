import { module } from 'angular';

import type { IStage } from '@spinnaker/core';
import { ExecutionDetailsTasks, Registry } from '@spinnaker/core';

import { manifestExecutionDetails } from '../ManifestExecutionDetails';
import { KUBERNETES_ROLLING_RESTART_MANIFEST_SETTINGS_FORM } from '../../../manifest/rollingRestart/rollingRestartSettingsForm.component';
import { KubernetesV2RollingRestartManifestConfigCtrl } from './rollingRestartManifestConfig.controller';

export const KUBERNETES_ROLLING_RESTART_MANIFEST_STAGE =
  'spinnaker.kubernetes.v2.pipeline.stage.rollingRestartManifestStage';
const STAGE_KEY = 'rollingRestartManifest';

module(KUBERNETES_ROLLING_RESTART_MANIFEST_STAGE, [KUBERNETES_ROLLING_RESTART_MANIFEST_SETTINGS_FORM])
  .config(() => {
    Registry.pipeline.registerStage({
      label: 'Rolling Restart (Manifest)',
      description: 'Rolling Restart.',
      key: STAGE_KEY,
      cloudProvider: 'kubernetes',
      templateUrl: require('./rollingRestartManifestConfig.html'),
      controller: 'KubernetesV2RollingRestartManifestConfigCtrl',
      controllerAs: 'ctrl',
      executionDetailsSections: [manifestExecutionDetails(STAGE_KEY), ExecutionDetailsTasks],
      accountExtractor: (stage: IStage): string[] => (stage.account ? [stage.account] : []),
      configAccountExtractor: (stage: any): string[] => (stage.account ? [stage.account] : []),
      validators: [
        { type: 'requiredField', fieldName: 'location', fieldLabel: 'Namespace' },
        { type: 'requiredField', fieldName: 'account', fieldLabel: 'Account' },
        { type: 'requiredField', fieldName: 'manifestName', fieldLabel: 'Kind' },
        { type: 'requiredField', fieldName: 'manifestName', fieldLabel: 'Name' },
      ],
    });
  })
  .controller('KubernetesV2RollingRestartManifestConfigCtrl', KubernetesV2RollingRestartManifestConfigCtrl);
