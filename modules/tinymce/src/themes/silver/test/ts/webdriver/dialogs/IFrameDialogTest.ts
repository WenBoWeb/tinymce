import { FocusTools, RealKeys, Waiter } from '@ephox/agar';
import { TestHelpers } from '@ephox/alloy';
import { after, before, describe, it } from '@ephox/bedrock-client';
import { Arr, Fun } from '@ephox/katamari';
import { Class, Focus, SugarDocument, SugarElement } from '@ephox/sugar';

import Env from 'tinymce/core/api/Env';
import { WindowManagerImpl } from 'tinymce/core/api/WindowManager';
import * as WindowManager from 'tinymce/themes/silver/ui/dialog/WindowManager';
import TestExtras from '../../module/TestExtras';

describe('webdriver.tinymce.themes.silver.dialogs.IFrameDialogTest', () => {
  before(function () {
    // TODO: TINY-2308 Get this test working on everything!
    if (Env.ie > 0 || Env.webkit || Env.gecko) {
      this.skip();
    }
  });

  let helpers: TestExtras;
  let windowManager: WindowManagerImpl;
  let style: SugarElement<HTMLStyleElement>;
  before(() => {
    helpers = TestExtras();
    windowManager = WindowManager.setup(helpers.extras);
    style = TestHelpers.GuiSetup.addStyles(SugarDocument.getDocument(), [
      '[role="dialog"] { border: 1px solid black; padding: 2em; background-color: rgb(131,193,249); top: 40px; position: absolute; }',

      ':focus { outline: 3px solid green; !important; }',
      // NOTE: this is just for aiding debugging. It only works in some browsers
      'iframe:focus-within { outline: 3px solid green; !important; }'
    ]);
  });

  after(() => {
    TestHelpers.GuiSetup.removeStyles(style);
    helpers.destroy();
  });

  it('Keyboard navigate dialog with iframe component', async () => {
    windowManager.open({
      title: 'Custom Dialog',
      body: {
        type: 'panel',
        items: [
          {
            name: 'input1',
            type: 'input'
          },
          {
            name: 'frame1',
            type: 'iframe'
          }
        ]
      },
      buttons: [
        {
          type: 'cancel',
          text: 'Close'
        }
      ],
      initialData: {
        input1: 'Dog',
        // NOTE: Tried some postMessage stuff to broadcast the scroll. Couldn't get it to work.
        // We can't just read the scroll value due to permissions
        frame1: '<!doctype html><html><head>' +
          '</head>' +
          '<body><h1>Heading</h1>' +
          Arr.map([ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 ], (n) => '<p>This is paragraph: ' + n + '</p>').join('\n') +
          '</body>'
      }
    }, {}, Fun.noop);

    await RealKeys.pSendKeysOn(
      'input',
      [
        RealKeys.text('\u0009')
      ]
    );
    await FocusTools.pTryOnSelector(
      'focus should be on iframe',
      SugarDocument.getDocument(),
      'iframe'
    );

    await Waiter.pWait(500);

    await RealKeys.pSendKeysOn(
      'iframe => body',
      [
        RealKeys.text('\uE015') // Arrow down
      ]
    );

    await RealKeys.pSendKeysOn(
      'iframe => body',
      [
        RealKeys.text('\u0009')
      ]
    );

    await FocusTools.pTryOnSelector(
      'focus should be on button (cancel)',
      SugarDocument.getDocument(),
      'button:contains("cancel")'
    );

    // Tag it for using with selenium. Note, I should just
    // implement the automatic id tagging in agar, and
    // pass in a DOM reference (or assume focused element)
    Focus.active().each((button) => {
      Class.add(button, 'cancel-button');
    });

    await RealKeys.pSendKeysOn(
      '.cancel-button',
      [
        RealKeys.combo({ shiftKey: true }, '\u0009')
      ]
    );

    await FocusTools.pTryOnSelector(
      'focus should move back to iframe (button >> iframe)',
      SugarDocument.getDocument(),
      'iframe'
    );

    await RealKeys.pSendKeysOn(
      'iframe => body',
      [
        RealKeys.combo({ shiftKey: true }, '\u0009')
      ]
    );

    await FocusTools.pTryOnSelector(
      'focus should move back to input (iframe >> input)',
      SugarDocument.getDocument(),
      'input'
    );
  });
});
