import React from 'react';
import type { Application, IModalComponentProps, IStage } from '@spinnaker/core';
import { noop, ReactInjector, ReactModal, TaskMonitor, WizardModal, WizardPage } from '@spinnaker/core';
import { WizardServerGroupBasicSettings } from './BasicSettings';
import { WizardServerGroupConfigFilesSettings } from './ConfigFiles';
import type { ICloudrunServerGroupCommandData } from '../serverGroupCommandBuilder.service';
import { CloudrunServerGroupCommandBuilder } from '../serverGroupCommandBuilder.service';

export interface ICloudrunServerGroupModalProps extends IModalComponentProps {
  title: string;
  application: Application;
  command: ICloudrunServerGroupCommandData;
  isNew?: boolean;
}

export interface ICloudrunServerGroupModalState {
  command: ICloudrunServerGroupCommandData;
  loaded: boolean;
  taskMonitor: TaskMonitor;
}

export class ServerGroupWizard extends React.Component<ICloudrunServerGroupModalProps, ICloudrunServerGroupModalState> {
  public static defaultProps: Partial<ICloudrunServerGroupModalProps> = {
    closeModal: noop,
    dismissModal: noop,
  };

  private _isUnmounted = false;

  /*     private serverGroupWriter: ServerGroupWriter; */
  public static show(props: ICloudrunServerGroupModalProps): Promise<ICloudrunServerGroupCommandData> {
    const modalProps = { dialogClassName: 'wizard-modal modal-lg' };
    return ReactModal.show(ServerGroupWizard, props, modalProps);
  }

  constructor(props: ICloudrunServerGroupModalProps) {
    super(props);
    if (!props.command) {
      CloudrunServerGroupCommandBuilder.buildNewServerGroupCommand(props.application).then((command) => {
        Object.assign(this.state.command, command);
        this.setState({ loaded: true });
      });
    }

    this.state = {
      loaded: !!props.command,
      command: props.command || ({} as ICloudrunServerGroupCommandData),
      taskMonitor: new TaskMonitor({
        application: props.application,
        title: `${this.props.isNew ? 'Creating' : 'Updating'} your Server Group`,
        modalInstance: TaskMonitor.modalInstanceEmulation(() => this.props.dismissModal()),
        onTaskComplete: this.onTaskComplete,
      }),
    };
  }

  private onTaskComplete = () => {
    this.props.application.serverGroups.refresh();
    this.props.application.serverGroups.onNextRefresh(null, this.onApplicationRefresh);
  };

  protected onApplicationRefresh = (): void => {
    if (this._isUnmounted) {
      return;
    }

    const { command } = this.props;
    const { taskMonitor } = this.state;
    const cloneStage = taskMonitor.task.execution.stages.find((stage: IStage) => stage.type === 'cloneServerGroup');
    if (cloneStage && cloneStage.context['deploy.server.groups']) {
      const newServerGroupName = cloneStage.context['deploy.server.groups'][command.command.region];
      if (newServerGroupName) {
        const newStateParams = {
          serverGroup: newServerGroupName,
          accountId: command.command.credentials,
          region: command.command.region,
          provider: 'cloudrun',
        };
        let transitionTo = '^.^.^.clusters.serverGroup';
        if (ReactInjector.$state.includes('**.clusters.serverGroup')) {
          // clone via details, all view
          transitionTo = '^.serverGroup';
        }
        if (ReactInjector.$state.includes('**.clusters.cluster.serverGroup')) {
          // clone or create with details open
          transitionTo = '^.^.serverGroup';
        }
        if (ReactInjector.$state.includes('**.clusters')) {
          // create new, no details open
          transitionTo = '.serverGroup';
        }
        ReactInjector.$state.go(transitionTo, newStateParams);
      }
    }
  };

  private submit = (c: ICloudrunServerGroupCommandData): void => {
    const command: any = CloudrunServerGroupCommandBuilder.copyAndCleanCommand(c.command);
    const submitMethod = () => ReactInjector.serverGroupWriter.cloneServerGroup(command, this.props.application);
    this.state.taskMonitor.submit(submitMethod);
  };
  public render() {
    const { dismissModal, isNew } = this.props;
    const { loaded, taskMonitor, command } = this.state;

    return (
      <WizardModal<ICloudrunServerGroupCommandData>
        heading={`${isNew ? 'Create New' : 'Update'} Server Group`}
        initialValues={command}
        loading={!loaded}
        taskMonitor={taskMonitor}
        dismissModal={dismissModal}
        closeModal={this.submit}
        submitButtonLabel={isNew ? 'Create' : 'Edit'}
        render={({ formik, nextIdx, wizard }) => (
          <>
            <WizardPage
              label="Basic Settings"
              wizard={wizard}
              order={nextIdx()}
              render={({ innerRef }) => <WizardServerGroupBasicSettings ref={innerRef} formik={formik} />}
            />

            <WizardPage
              label="Config Files"
              wizard={wizard}
              order={nextIdx()}
              render={({ innerRef }) => <WizardServerGroupConfigFilesSettings ref={innerRef} formik={formik} />}
            />
          </>
        )}
      />
    );
  }
}
