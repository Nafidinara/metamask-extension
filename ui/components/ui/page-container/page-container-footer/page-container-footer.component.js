import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import Button from '../../button';
import {AUTOMATION_CONFIG} from '../../../../helpers/constants/automation';

// edited by: alfara
export default class PageContainerFooter extends Component {
  static propTypes = {
    children: PropTypes.node,
    onCancel: PropTypes.func,
    cancelText: PropTypes.string,
    cancelButtonType: PropTypes.string,
    onSubmit: PropTypes.func,
    submitText: PropTypes.string,
    disabled: PropTypes.bool,
    submitButtonType: PropTypes.string,
    hideCancel: PropTypes.bool,
    buttonSizeLarge: PropTypes.bool,
    footerClassName: PropTypes.string,
    footerButtonClassName: PropTypes.string,
  };

  static contextTypes = {
    t: PropTypes.func,
  };

  pollInterval = null;

  async componentDidMount() {
    await this.tryAutoSubmit();
  }

  async componentDidUpdate(prevProps) {
    const { submitText, disabled } = this.props;

    // Check if the button text has changed from the previous props
    if (submitText !== prevProps.submitText && !disabled) {
      await this.tryAutoSubmit();
    }
  }

  componentWillUnmount() {
    // Clear the polling interval if the component is unmounted
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
    }
  }

  // Method to repeatedly check if the button is enabled and submit
  tryAutoSubmit = async () => {
    const { onSubmit, disabled } = this.props;

    // Start polling to check when the button is enabled
    this.pollInterval = setInterval(() => {
      if (onSubmit && !disabled) {
        onSubmit();
        clearInterval(this.pollInterval); // Stop polling once the button is clicked
      }
    }, 100); // Check every 100ms (adjust as needed)
  }

  render() {
    const {
      children,
      onCancel,
      cancelText,
      onSubmit, // Not used in render, used in componentDidMount instead
      submitText,
      disabled,
      submitButtonType,
      hideCancel,
      cancelButtonType,
      buttonSizeLarge = false,
      footerClassName,
      footerButtonClassName,
    } = this.props;

    return (
      <div className={classnames('page-container__footer', footerClassName)}>
        <footer>
          {!hideCancel && (
            <Button
              type={cancelButtonType || 'secondary'}
              large={buttonSizeLarge}
              className={classnames(
                'page-container__footer-button',
                'page-container__footer-button__cancel',
                footerButtonClassName,
              )}
              onClick={(e) => onCancel(e)}
              data-testid="page-container-footer-cancel"
            >
              {cancelText || this.context.t('cancel')}
            </Button>
          )}

          <Button
            type={submitButtonType || 'primary'}
            large={buttonSizeLarge}
            className={classnames(
              'page-container__footer-button',
              footerButtonClassName,
            )}
            disabled={disabled}
            onClick={(e) => onSubmit(e)} // This will still trigger if user clicks manually
            data-testid="page-container-footer-next"
          >
            {submitText || this.context.t('next')}
          </Button>
        </footer>

        {children && (
          <div className="page-container__footer-secondary">{children}</div>
        )}
      </div>
    );
  }
}
