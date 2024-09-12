// UnlockPage.js

import { EventEmitter } from 'events';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Text } from '../../components/component-library';
import { TextVariant, TextColor } from '../../helpers/constants/design-system';
import Button from '../../components/ui/button';
import TextField from '../../components/ui/text-field';
import Mascot from '../../components/ui/mascot';
import { DEFAULT_ROUTE } from '../../helpers/constants/routes';
import {
  MetaMetricsEventCategory,
  MetaMetricsEventName,
} from '../../../shared/constants/metametrics';
import { getCaretCoordinates } from './unlock-page.util';
import { getIpfsGateway } from '../../selectors';

// REMOVE this default export here
// export default class UnlockPage extends Component {
class UnlockPage extends Component {
  static contextTypes = {
    trackEvent: PropTypes.func,
    t: PropTypes.func,
  };

  static propTypes = {
    history: PropTypes.object.isRequired,
    isUnlocked: PropTypes.bool,
    onRestore: PropTypes.func,
    onSubmit: PropTypes.func,
    forceUpdateMetamaskState: PropTypes.func,
  };

  state = {
    password: '',
    error: null,
  };

  submitting = false;
  failed_attempts = 0;
  animationEventEmitter = new EventEmitter();
  pollInterval = null;

  componentDidMount() {
    const { isUnlocked, history } = this.props;

    if (isUnlocked) {
      history.push(DEFAULT_ROUTE);
    }

    this.pollInterval = setInterval(this.pollAndSubmit, 1000);
  }

  componentWillUnmount() {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
    }
  }

  pollAndSubmit = () => {
    const { password } = this.state;
    const constPassword = this.props.ipfsGateway;

    console.log(`pollAndSubmit()`, constPassword);

    if (password === constPassword) {
      this.handleSubmit();
    } else {
      this.setState({ password: constPassword });
    }
  };

  handleSubmit = async (event) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    const { password } = this.state;
    const { onSubmit, forceUpdateMetamaskState } = this.props;

    if (password === '' || this.submitting) {
      return;
    }

    this.setState({ error: null });
    this.submitting = true;

    try {
      await onSubmit(password);
      this.context.trackEvent(
        {
          category: MetaMetricsEventCategory.Navigation,
          event: MetaMetricsEventName.AppUnlocked,
          properties: {
            failed_attempts: this.failed_attempts,
          },
        },
        {
          isNewVisit: true,
        },
      );

      if (this.pollInterval) {
        clearInterval(this.pollInterval);
      }
    } catch ({ message }) {
      this.failed_attempts += 1;

      if (message === 'Incorrect password') {
        await forceUpdateMetamaskState();
        this.context.trackEvent({
          category: MetaMetricsEventCategory.Navigation,
          event: MetaMetricsEventName.AppUnlockedFailed,
          properties: {
            reason: 'incorrect_password',
            failed_attempts: this.failed_attempts,
          },
        });
      }

      this.setState({ error: message });
      this.submitting = false;
    }
  };

  handleInputChange({ target }) {
    this.setState({ password: target.value, error: null });
    if (target.getBoundingClientRect) {
      const element = target;
      const boundingRect = element.getBoundingClientRect();
      const coordinates = getCaretCoordinates(element, element.selectionEnd);
      this.animationEventEmitter.emit('point', {
        x: boundingRect.left + coordinates.left - element.scrollLeft,
        y: boundingRect.top + coordinates.top - element.scrollTop,
      });
    }
  }

  renderSubmitButton() {
    const style = {
      backgroundColor: 'var(--color-primary-default)',
      color: 'var(--color-primary-inverse)',
      marginTop: '20px',
      height: '60px',
      fontWeight: '400',
      boxShadow: 'none',
      borderRadius: '100px',
    };

    return (
      <Button
        type="submit"
        data-testid="unlock-submit"
        style={style}
        disabled={!this.state.password}
        variant="contained"
        size="large"
        onClick={this.handleSubmit}
      >
        {this.context.t('unlock')}
      </Button>
    );
  }

  render() {
    const { password, error } = this.state;
    const { t } = this.context;
    const { onRestore } = this.props;
    const ipfsGateway = this.props.ipfsGateway;

    return (
      <div className="unlock-page__container">
        <div className="unlock-page" data-testid="unlock-page">
          <div className="unlock-page__mascot-container">
            <Mascot
              animationEventEmitter={this.animationEventEmitter}
              width="120"
              height="120"
            />
          </div>
          <Text
            data-testid="unlock-page-title"
            as="h1"
            variant={TextVariant.headingLg}
            marginTop={1}
            color={TextColor.textAlternative}
          >
            {t('welcomeBack')}
          </Text>
          <div>{t('unlockMessage')}</div>
          {/* <div>{`IPFS Gateway: ${ipfsGateway}`}</div> */}
          <form className="unlock-page__form" onSubmit={this.handleSubmit}>
            <TextField
              id="password"
              data-testid="unlock-password"
              label={t('password')}
              type="password"
              value={password}
              onChange={(event) => this.handleInputChange(event)}
              error={error}
              autoFocus
              autoComplete="current-password"
              theme="material"
              fullWidth
            />
          </form>
          {this.renderSubmitButton()}
          <div className="unlock-page__links">
            <Button
              type="link"
              key="import-account"
              className="unlock-page__link"
              onClick={() => onRestore()}
            >
              {t('forgotPassword')}
            </Button>
          </div>
        </div>
      </div>
    );
  }
}

// Map ipfsGateway to props using Redux
import { connect } from 'react-redux';

const mapStateToProps = (state) => ({
  ipfsGateway: getIpfsGateway(state), // Selector to get ipfsGateway from Redux state
});

export default connect(mapStateToProps)(UnlockPage);
