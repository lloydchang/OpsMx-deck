/* eslint-disable @spinnaker/import-sort */
import { get } from 'lodash';
import React from 'react';
import { Dropdown } from 'react-bootstrap';

import type { Application } from '../../application';
import { CreatePipelineButton } from '../create/CreatePipelineButton';
import type { IPipeline } from '../../domain';
import { Tooltip } from '../../presentation/Tooltip';
import { ReactInjector } from '../../reactShims';
import { logger } from '../../utils';
import { FilterSearch } from '../../cluster/filter/FilterSearch';

export interface ICreatePipelineProps {
  application: Application;
}
export interface IFilterState {
  searchString: string;
  pipelineNames: IPipeline[];
  strategyNames: IPipeline[];
}
export class CreatePipeline extends React.Component<ICreatePipelineProps> {
  public pipelineConfigExists = get(this.props.application, 'pipelineConfigs.data', []);
  public strategyConfigExists = get(this.props.application, 'strategyConfigs.data', []);
  public state: IFilterState = {
    searchString: '',
    pipelineNames: this.pipelineConfigExists,
    strategyNames: this.strategyConfigExists,
  };
  private dropdownToggled = (): void => {
    this.setState({
      searchString: '',
      pipelineNames: this.pipelineConfigExists,
      strategyNames: this.strategyConfigExists,
    });
    logger.log({ category: 'Pipelines', action: 'Configure (top level)' });
  };

  private searchFieldUpdated = (event: React.FormEvent<HTMLInputElement>): void => {
    this.setState({ searchString: event.currentTarget.value }, () => this.refreshPipelineConfigs());
  };

  private get hasPipelineConfig() {
    return this.pipelineConfigExists && this.pipelineConfigExists.length > 0;
  }
  private get hasStrategyConfig() {
    return this.strategyConfigExists && this.strategyConfigExists.length > 0;
  }

  private refreshPipelineConfigs(): void {
    const { searchString } = this.state;
    let config = [];
    if (searchString && searchString.length > 0) {
      if (this.hasPipelineConfig) {
        config = this.pipelineConfigExists.filter((pipelineName) =>
          pipelineName.name.toLocaleLowerCase().includes(searchString.trim().toLocaleLowerCase()),
        );
        this.setState({ pipelineNames: config });
      } else if (this.hasStrategyConfig) {
        config = this.strategyConfigExists.filter((pipelineName) =>
          pipelineName.name.toLocaleLowerCase().includes(searchString.trim().toLocaleLowerCase()),
        );
        this.setState({ strategyNames: config });
      }
    } else {
      this.setState({ pipelineNames: this.pipelineConfigExists, strategyNames: this.strategyConfigExists });
    }
  }
  public render() {
    const { searchString, pipelineNames, strategyNames } = this.state;
    const hasPipelineConfigs = this.hasPipelineConfig;
    const hasStrategyConfigs = this.hasStrategyConfig;
    const header = !(hasPipelineConfigs || hasStrategyConfigs) ? (
      <li className="dropdown-header" style={{ marginTop: 0 }}>
        None yet, click <span style={{ marginLeft: '2px' }} className="glyphicon glyphicon-plus-sign" /> Create
      </li>
    ) : hasPipelineConfigs ? (
      <li className="dropdown-header" style={{ marginTop: 0 }}>
        PIPELINES
      </li>
    ) : hasStrategyConfigs ? (
      <li className="dropdown-header" style={{ marginTop: 0 }}>
        DEPLOYMENT STRATEGIES
      </li>
    ) : null;

    return (
      <Dropdown
        className="dropdown"
        id="create-pipeline-dropdown"
        style={{ marginRight: '5px' }}
        onToggle={this.dropdownToggled}
      >
        <CreatePipelineButton application={this.props.application} />
        <Dropdown.Toggle className="btn btn-sm btn-default dropdown-toggle">
          <span className="visible-xl-inline">
            <span className="glyphicon glyphicon-cog" /> Configure
          </span>
          <Tooltip value="Configure pipelines">
            <span className="hidden-xl-inline">
              <span className="glyphicon glyphicon-cog" />
            </span>
          </Tooltip>
        </Dropdown.Toggle>
        <Dropdown.Menu className="dropdown-menu">
          {header}
          {(hasPipelineConfigs || hasStrategyConfigs) && (
            <FilterSearch
              value={searchString}
              onBlur={this.searchFieldUpdated}
              onSearchChange={this.searchFieldUpdated}
            />
          )}
          {pipelineNames && (
            <div style={{ overflow: 'auto', maxWidth: '300px', maxHeight: '300px' }}>
              {pipelineNames &&
                pipelineNames.map((pipeline: IPipeline) => (
                  <Pipeline key={pipeline.id} pipeline={pipeline} type="pipeline" />
                ))}
            </div>
          )}
          {hasStrategyConfigs && (
            <div style={{ overflow: 'auto', maxWidth: '300px', maxHeight: '300px' }}>
              {hasStrategyConfigs &&
                strategyNames &&
                strategyNames.map((pipeline: any) => (
                  <Pipeline key={pipeline.id} pipeline={pipeline} type="strategy" />
                ))}
            </div>
          )}
          {!hasStrategyConfigs && hasPipelineConfigs && !pipelineNames.length && (
            <span style={{ padding: '10px' }}>No Pipelines Found</span>
          )}
          {!hasPipelineConfigs && hasStrategyConfigs && !strategyNames.length && (
            <span style={{ padding: '10px' }}>No Deployment Strategies Found</span>
          )}
        </Dropdown.Menu>
      </Dropdown>
    );
  }
}

const Pipeline = (props: { pipeline: any; type: 'pipeline' | 'strategy' }): JSX.Element => {
  const clicked = () => {
    logger.log({ category: 'Pipelines', action: `Configure ${props.type} (via top level)` });
    const { $state } = ReactInjector;
    if (!$state.current.name.includes('.executions.execution')) {
      $state.go('^.pipelineConfig', { pipelineId: props.pipeline.id });
    } else {
      $state.go('^.^.pipelineConfig', { pipelineId: props.pipeline.id });
    }
  };
  return (
    <li>
      <a onClick={clicked}>
        {props.pipeline.name} {props.pipeline.disabled && props.type === 'pipeline' && <span>(disabled)</span>}
      </a>
    </li>
  );
};
