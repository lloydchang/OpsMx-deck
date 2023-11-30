import type { IComponentOptions } from 'angular';
import { module } from 'angular';

const kubernetesRollingRestartManifestSettingsFormComponent: IComponentOptions = {
  bindings: { settings: '=' },
  controllerAs: 'ctrl',
  template: `
    <div class="form-horizontal">
      <div class="form-group form-inline">
        <div class="col-md-3 sm-label-right">
          Replicas
        </div>
        <div class="col-md-4">
          <input type="text"
                 class="form-control input-sm highlight-pristine"
                 ng-model="ctrl.settings.replicas"
                 min="0"/>
        </div>
      </div>
    </div>
  `,
};

export const KUBERNETES_ROLLING_RESTART_MANIFEST_SETTINGS_FORM =
  'spinnaker.kubernetes.v2.kubernetes.manifest.rollingRestart.settingsForm.component';
module(KUBERNETES_ROLLING_RESTART_MANIFEST_SETTINGS_FORM, []).component(
  'kubernetesRollingRestartManifestSettingsForm',
  kubernetesRollingRestartManifestSettingsFormComponent,
);
