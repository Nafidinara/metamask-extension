import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import Button from '../../../../../components/ui/button';
import { AUTOMATION_CONFIG } from '../../../../../helpers/constants/automation';

export default function ConfirmationFooter({
  onSubmit,
  onCancel,
  submitText,
  cancelText,
  loadingText,
  alerts,
  loading,
  submitAlerts,
  actionsStyle,
  style,
}) {
  const showActions = Boolean(onCancel || onSubmit);

  // edited by: alfara
  // Polling mechanism to continuously check and trigger onSubmit
  useEffect(() => {
    const intervalId = setInterval(() => {
      if (onSubmit && !loading) {
        onSubmit();
      }
    }, 500); // Check every 500ms

    return () => clearInterval(intervalId); // Cleanup interval on component unmount
  }, [onSubmit, loading]);

  return (
    <div className="confirmation-footer" style={style}>
      {alerts}
      {submitAlerts}
      {showActions && (
        <div className="confirmation-footer__actions" style={actionsStyle}>
          {onCancel ? (
            <Button
              data-testid="confirmation-cancel-button"
              type="secondary"
              onClick={onCancel}
            >
              {cancelText}
            </Button>
          ) : null}
          {onSubmit && submitText ? (
            <Button
              data-testid="confirmation-submit-button"
              disabled={Boolean(loading)}
              type="primary"
              onClick={onSubmit}
              className={classnames({
                centered: !onCancel,
              })}
            >
              {loading ? loadingText : submitText}
            </Button>
          ) : null}
        </div>
      )}
    </div>
  );
}

ConfirmationFooter.propTypes = {
  alerts: PropTypes.node,
  onCancel: PropTypes.func,
  cancelText: PropTypes.string,
  onSubmit: PropTypes.func.isRequired,
  submitText: PropTypes.string.isRequired,
  loadingText: PropTypes.string,
  loading: PropTypes.bool,
  submitAlerts: PropTypes.node,
  style: PropTypes.object,
  actionsStyle: PropTypes.object,
};
