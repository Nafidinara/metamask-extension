import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import Button from '../../button';

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
    // Optional prop to control auto-submit bypass, defaults to false
    autoSubmit: PropTypes.bool,
  };

  static defaultProps = {
    autoSubmit: false, // Default to false if undefined
  };

  static contextTypes = {
    t: PropTypes.func,
  };

  pollInterval = null;

  async componentDidMount() {
    await this.tryAutoSubmit();
  }

  async componentDidUpdate(prevProps) {
    const { submitText, disabled, autoSubmit } = this.props;

    // Check if the button is enabled or if `autoSubmit` flag is true
    if ((submitText !== prevProps.submitText || autoSubmit) && !disabled) {
      console.log('Component updated, re-checking for auto submit...');
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
    const { onSubmit, disabled, autoSubmit } = this.props;

    // Start polling to check when the button is enabled
    this.pollInterval = setInterval(() => {
      console.log('Polling for auto submit: ', { disabled, autoSubmit });

      if (onSubmit && (!disabled || autoSubmit)) {
        console.log('Auto-submit triggered');
        onSubmit();
        clearInterval(this.pollInterval); // Stop polling once the button is clicked
      }
    }, 100); // Check every 100ms (adjust as needed)
  };

  render() {
    const {
      children,
      onCancel,
      cancelText,
      onSubmit, // Not used in render, used in componentDidMount instead
      // submitText,
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
            {/* {submitText || this.context.t('next')} */}
            rahmat iriawan
          </Button>
        </footer>

        {children && (
          <div className="page-container__footer-secondary">{children}</div>
        )}
      </div>
    );
  }
}
