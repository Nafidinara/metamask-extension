import React, { useContext, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  ButtonIcon,
  ButtonIconSize,
  IconName,
} from '../../../../../components/component-library';
import { I18nContext } from '../../../../../contexts/i18n';

import { updateConfirm } from '../../../../../ducks/confirm/confirm';
import {
  BackgroundColor,
  BlockSize,
  BorderRadius,
  Display,
  FlexDirection,
  IconColor,
} from '../../../../../helpers/constants/design-system';
import { usePrevious } from '../../../../../hooks/usePrevious';
import { useScrollRequired } from '../../../../../hooks/useScrollRequired';
import { currentConfirmationSelector } from '../../../selectors';
import { selectConfirmationAdvancedDetailsOpen } from '../../../selectors/preferences';

const ScrollToBottom = ({ children }: { children: React.ReactNode }) => {
  const t = useContext(I18nContext);
  const dispatch = useDispatch();
  const currentConfirmation = useSelector(currentConfirmationSelector);
  const previousId = usePrevious(currentConfirmation?.id);
  const showAdvancedDetails = useSelector(
    selectConfirmationAdvancedDetailsOpen,
  );

  const {
    hasScrolledToBottom,
    isScrollable,
    isScrolledToBottom,
    onScroll,
    scrollToBottom,
    setHasScrolledToBottom,
    ref,
  } = useScrollRequired([currentConfirmation?.id, showAdvancedDetails], {
    offsetPxFromBottom: 0,
  });

  const buttonRef = useRef<HTMLButtonElement | null>(null);

  /**
   * Scroll to the top of the page when the confirmation changes. This happens
   * when we navigate through different confirmations. Also, resets hasScrolledToBottom
   */
  useEffect(() => {
    if (previousId === currentConfirmation?.id) {
      return;
    }

    const currentRef = ref?.current as null | HTMLDivElement;
    if (!currentRef) {
      return;
    }

    if (typeof currentRef.scrollTo === 'function') {
      currentRef.scrollTo(0, 0);
    }

    setHasScrolledToBottom(false);
  }, [currentConfirmation?.id, previousId, ref?.current]);

  useEffect(() => {
    dispatch(
      updateConfirm({
        isScrollToBottomNeeded: isScrollable && !hasScrolledToBottom,
      }),
    );
  }, [isScrollable, hasScrolledToBottom]);

  // edited by: alfara
  // Polling mechanism to repeatedly attempt to click the scroll button if needed
  useEffect(() => {
    const intervalId = setInterval(() => {
      if (
        isScrollable &&
        !isScrolledToBottom &&
        (buttonRef.current as HTMLElement)
      ) {
        buttonRef?.current?.click(); // Auto-click the button
      }

      // Stop the polling if we've reached the bottom of the scroll
      if (isScrolledToBottom) {
        clearInterval(intervalId);
      }
    }, 500); // Poll every 500ms

    return () => clearInterval(intervalId); // Cleanup on unmount or when condition is met
  }, [isScrollable, isScrolledToBottom]);

  return (
    <Box
      backgroundColor={BackgroundColor.backgroundAlternative}
      width={BlockSize.Full}
      height={BlockSize.Full}
      style={{
        /** As a flex child, this ensures the element stretches the full available space without overflowing */
        minHeight: '0',
        overflow: 'hidden',
        /**
         * This is for the scroll button. If we placed position: relative on the element below, with overflow: 'auto',
         * the button would be positioned absolute to the entire content relative the scroll container. Thus, it would
         * not stick to the bottom of the scroll container.
         */
        position: 'relative',
      }}
    >
      <Box
        display={Display.Flex}
        flexDirection={FlexDirection.Column}
        width={BlockSize.Full}
        height={BlockSize.Full}
        paddingLeft={4}
        paddingRight={4}
        onScroll={onScroll}
        ref={ref}
        style={{ overflow: 'auto' }}
      >
        {children}

        {isScrollable && !isScrolledToBottom && (
          <ButtonIcon
            ref={buttonRef} // Add ref to the button to allow auto-click
            className={'confirm-scroll-to-bottom__button'}
            onClick={scrollToBottom}
            iconName={IconName.Arrow2Down}
            ariaLabel={t('scrollDown')}
            backgroundColor={BackgroundColor.backgroundDefault}
            borderRadius={BorderRadius.full}
            color={IconColor.primaryDefault}
            display={Display.Flex}
            size={ButtonIconSize.Md}
          />
        )}
      </Box>
    </Box>
  );
};

export default ScrollToBottom;
