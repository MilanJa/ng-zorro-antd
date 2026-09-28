/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
// Shim for `antd/es/notification/style/index.js`. `antd/es/message/style/index.js` imports only
// `prepareNotificationToken` and `sharedGenerateStyle` from that module (Message reuses Notification's
// token shape and shared list/item/placement style generators -- the two components share almost all
// of their CSS). The real module also calls `genStyleHooks('Notification', ...)` and
// `genSubStyleComponent(['Notification', 'PurePanel'], ...)` at module scope, which registers a second,
// unrelated component ("Notification") in our shimmed recorder as a side effect of Message's import --
// the same class of leak `shims/grid-style.js` dodges for Modal/Grid (see its header comment). Message
// is the only `v6Components` entry that reaches this module today, and it never uses the default
// export, so shimming out the two registration calls and keeping only the two helpers it actually
// imports is safe.
//
// TODO(wave 2): if a future task adds `notification` to `v6Components`, this shim's dodge stops
// working -- `antd/es/notification/style/index.js` must then run for real (including its own
// `genStyleHooks('Notification', ...)`), and this file (and the bundle-engine.ts redirect that points
// `../../notification/style` at it from `/message/style/`) should be removed.
import { unit } from '@ant-design/cssinjs';

import { CONTAINER_MAX_OFFSET } from 'antd/es/_util/hooks';
import { resetComponent } from 'antd/es/style';
import { mergeToken } from 'antd/es/theme/internal';
import genNotificationStyle from 'antd/es/notification/style/notification.js';
import genNotificationPlacementStyle from 'antd/es/notification/style/placement.js';

const DEFAULT_COLLAPSED_STACK_VISIBLE_COUNT = 3;

/** Derive internal Notification style tokens from alias and component tokens (real logic, copied). */
export const prepareNotificationToken = token => {
  const notificationPaddingVertical = token.paddingMD;
  const notificationPaddingHorizontal = token.paddingLG;
  return mergeToken(token, {
    notificationBg: token.colorBgElevated,
    notificationPaddingVertical,
    notificationPaddingHorizontal,
    notificationIconSize: token.calc(token.fontSizeLG).mul(token.lineHeightLG).equal(),
    notificationCloseButtonSize: token.calc(token.controlHeightLG).mul(0.55).equal(),
    notificationMarginBottom: token.margin,
    notificationPadding: `${unit(token.paddingMD)} ${unit(token.paddingContentHorizontalLG)}`,
    notificationMarginEdge: token.marginLG,
    notificationProgressHeight: 2,
    notificationMotionOffset: 64
  });
};

const getStackNoticeClipPath = offset => `inset(${offset} ${offset} ${offset} ${offset})`;

const genNotificationListContentStyle = token => {
  const { componentCls, motionDurationMid, motionDurationSlow, motionEaseInOut } = token;
  const listCls = `${componentCls}-list`;
  const listContentCls = `${listCls}-content`;
  return {
    [listContentCls]: {
      position: 'relative',
      display: 'flex',
      flexShrink: 0,
      flexDirection: 'column',
      gap: token.notificationMarginBottom,
      width: '100%',
      willChange: 'height, transform',
      transition: 'none',
      [`&${listContentCls}-decrease`]: {
        transition: `height calc(${motionDurationSlow} * 2) ${motionEaseInOut} ${motionDurationMid}`
      }
    },
    [`${componentCls}-fade`]: {
      backfaceVisibility: 'hidden',
      willChange: 'transform, opacity'
    }
  };
};

const genNotificationListStyle = (token, config) => {
  const { componentCls, notificationMarginEdge } = token;
  const notificationMarginEdgeVar = '--notification-margin-edge';
  const noticeCls = `${componentCls}-notice`;
  const listCls = `${componentCls}-list`;
  const listWidth = config.listWidthKey
    ? token.calc(token[config.listWidthKey]).add(token.calc(notificationMarginEdge).mul(2)).equal()
    : '100%';
  const stackVisibleCount = config.stackVisibleCount ?? DEFAULT_COLLAPSED_STACK_VISIBLE_COUNT;
  const noticeBeyondStackVisibleCountCls = `${noticeCls}:nth-last-child(n + ${stackVisibleCount + 1})`;
  const stackShadowClipOffset = unit(token.calc(token.marginXXL).mul(-1).equal());
  const stackNoticeClipPath = getStackNoticeClipPath(stackShadowClipOffset);
  return {
    [componentCls]: {
      ...resetComponent(token),
      [notificationMarginEdgeVar]: unit(notificationMarginEdge),
      position: 'fixed',
      zIndex: token.zIndexPopup,
      width: listWidth,
      maxWidth: '100vw',
      height: '100vh',
      overflow: 'hidden',
      overscrollBehavior: 'contain',
      [`${componentCls}-hook-holder`]: {
        position: 'relative'
      },
      [`&${listCls}`]: {
        maxHeight: '100vh',
        padding: `var(${notificationMarginEdgeVar})`,
        overflowX: 'hidden',
        overflowY: 'auto',
        overscrollBehavior: 'contain',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
        pointerEvents: 'none',
        '&::-webkit-scrollbar': {
          display: 'none',
          width: 0,
          height: 0
        }
      },
      ...genNotificationListContentStyle(token),
      [`&${componentCls}-stack`]: {
        [noticeCls]: {
          clipPath: stackNoticeClipPath
        },
        [`&:not(${componentCls}-stack-expanded)`]: {
          [noticeCls]: {
            '--notification-scale': 'calc(1 - min(var(--notification-index, 0), 2) * 0.06)'
          },
          [`${noticeCls}:not(${noticeCls}-stack-in-threshold)`]: {
            opacity: 0,
            pointerEvents: 'none'
          },
          [noticeBeyondStackVisibleCountCls]: {
            opacity: 0,
            pointerEvents: 'none'
          }
        }
      },
      '&-rtl': {
        direction: 'rtl',
        [`${noticeCls}-actions`]: {
          float: 'left'
        }
      }
    }
  };
};

/** Compose the shared list, item, and placement styles (real logic, copied). */
export const sharedGenerateStyle = (token, config) => {
  const itemStyle = config.itemStyle ?? genNotificationStyle;
  return [genNotificationListStyle(token, config), itemStyle(token), genNotificationPlacementStyle(token)];
};
