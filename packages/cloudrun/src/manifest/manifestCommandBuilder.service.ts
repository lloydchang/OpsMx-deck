import { load } from 'js-yaml';
import { cloneDeep, has } from 'lodash';
import { $q } from 'ngimport';

import type { Application, IAccountDetails, IArtifactAccount, IMoniker } from '@spinnaker/core';
import { AccountService } from '@spinnaker/core';

import { ManifestSource } from './ManifestSource';

const LAST_APPLIED_CONFIGURATION = 'kubectl.kubernetes.io/last-applied-configuration';

export interface ICloudrunManifestCommandData {
  command: ICloudrunManifestCommand;
  metadata: ICloudrunManifestCommandMetadata;
}

export interface ICloudrunManifestCommand {
  account: string;
  cloudProvider: string;
  manifest: any; // deprecated
  manifests: any[];
  relationships: ICloudrunManifestSpinnakerRelationships;
  moniker: IMoniker;
  manifestArtifactId?: string;
  manifestArtifactAccount?: string;
  source: ManifestSource;
  versioned?: boolean;
}

export interface ICloudrunManifestCommandMetadata {
  backingData: any;
}

export interface ICloudrunManifestSpinnakerRelationships {
  loadBalancers?: string[];
  securityGroups?: string[];
}

export class CloudrunManifestCommandBuilder {
  // TODO(lwander) add explanatory error messages
  public static manifestCommandIsValid(command: ICloudrunManifestCommand): boolean {
    if (!command.moniker) {
      return false;
    }

    if (!command.moniker.app) {
      return false;
    }

    return true;
  }

  public static copyAndCleanCommand(input: ICloudrunManifestCommand): ICloudrunManifestCommand {
    const command = cloneDeep(input);
    return command;
  }

  public static buildNewManifestCommand(
    app: Application,
    sourceManifest?: any,
    sourceMoniker?: IMoniker,
    sourceAccount?: string,
  ): PromiseLike<ICloudrunManifestCommandData> {
    if (sourceManifest != null && has(sourceManifest, ['metadata', 'annotations', LAST_APPLIED_CONFIGURATION])) {
      sourceManifest = load(sourceManifest.metadata.annotations[LAST_APPLIED_CONFIGURATION]);
    }

    const dataToFetch = {
      accounts: AccountService.getAllAccountDetailsForProvider('cloudrun'),
      artifactAccounts: AccountService.getArtifactAccounts(),
    };

    // TODO(dpeach): if no callers of this method are Angular controllers,
    // $q.all may be safely replaced with Promise.all.
    return $q
      .all(dataToFetch)
      .then((backingData: { accounts: IAccountDetails[]; artifactAccounts: IArtifactAccount[] }) => {
        const { accounts, artifactAccounts } = backingData;

        const account = accounts.some((a) => a.name === sourceAccount)
          ? accounts.find((a) => a.name === sourceAccount).name
          : accounts.length
          ? accounts[0].name
          : null;

        let manifestArtifactAccount: string = null;
        const [artifactAccountData] = artifactAccounts;
        if (artifactAccountData) {
          manifestArtifactAccount = artifactAccountData.name;
        }

        const cloudProvider = 'cloudrun';
        const moniker = sourceMoniker || {
          app: app.name,
        };

        const relationships = {
          loadBalancers: [] as string[],
          securityGroups: [] as string[],
        };

        const versioned: any = null;

        return {
          command: {
            cloudProvider,
            manifest: null,
            manifests: Array.isArray(sourceManifest)
              ? sourceManifest
              : sourceManifest != null
              ? [sourceManifest]
              : null,
            relationships,
            moniker,
            account,
            versioned,
            manifestArtifactAccount,
            source: ManifestSource.TEXT,
          },
          metadata: {
            backingData,
          },
        } as ICloudrunManifestCommandData;
      });
  }
}
