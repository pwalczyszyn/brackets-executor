/* global define, $, brackets, Mustache */

define(function (require, exports, module) {
    'use strict';

    // Get module dependencies.
    var Async = brackets.getModule('utils/Async'),
        Menus = brackets.getModule('command/Menus'),
        CommandManager = brackets.getModule('command/CommandManager'),
        Commands = brackets.getModule('command/Commands'),
        NodeConnection = brackets.getModule('utils/NodeConnection'),
        PreferencesManager = brackets.getModule('preferences/PreferencesManager'),
        ProjectManager = brackets.getModule('project/ProjectManager'),
        EditorManager = brackets.getModule('editor/EditorManager'),
        DocumentManager = brackets.getModule('document/DocumentManager'),
        PanelManager = brackets.getModule('view/PanelManager'),
        Resizer = brackets.getModule('utils/Resizer'),
        AppInit = brackets.getModule('utils/AppInit'),
        FileUtils = brackets.getModule('file/FileUtils'),
        FileSystem = brackets.getModule('filesystem/FileSystem'),
        StringUtils = brackets.getModule('utils/StringUtils'),
        ExtensionUtils = brackets.getModule('utils/ExtensionUtils'),
        bottomPanelTemplate = require('text!html/bottom-panel.html'),
        $executorPanel,
        nodeDomain,
        nodeConnection;

    function executeCommand(cmd, args) {

        nodeDomain.executeCommand(cmd, args).done(function () {

            console.log('command executed');
            popLogs();

        }).fail(function (err) {

            console.log('command execution failed', err);

        });

    }

    function popLogs() {
        nodeDomain.popLogs().done(function (logs) {

            if (logs) {
                console.log(logs);
                if (logs.length === 0 || logs[logs.length - 1].indexOf('close:') !== 0) {
                    popLogs();
                }
            }

        }).fail(function (err) {

            console.log('popping logs failed', err);

        });
    }

    function initNodeDomain(callback) {
        // Creating new node connection
        nodeConnection = new NodeConnection();

        var connectionPromise = nodeConnection.connect(true),
            errorHandler = function (err) {
                nodeConnection = null;

                console.error('[brackets-executor] failed to load node domain:', err);

                callback(err);
            };

        connectionPromise.done(function () {
            var path = ExtensionUtils.getModulePath(module, 'node/index'),
                loadPromise = nodeConnection.loadDomains([path], true);

            loadPromise.done(function () {
                nodeDomain = nodeConnection.domains.executor;
                callback();
            }).fail(errorHandler);

        }).fail(errorHandler);
    }

    AppInit.appReady(function () {

        // Load stylesheet.
        ExtensionUtils.loadStyleSheet(module, "executor.css");

        initNodeDomain(function (err) {
            if (err) {
                return;
            }

            var executorHTML = Mustache.render(bottomPanelTemplate, {}),
                bottomPanel = PanelManager.createBottomPanel('outofme.bracketsExecutor.panel', $(executorHTML), 100);

            //        executor__run-button

            // Cache todo panel.
            $executorPanel = $('#brackets-executor');

            // Show panel.
            Resizer.show($executorPanel);

            $executorPanel.on('click', '.close', function () {
                Resizer.hide($executorPanel);
            }).on('click', '.executor__run-button.active', function () {
                var $cmdInput = $executorPanel.find('.executor__cmd-input');
                var args = $cmdInput.val().split(' ');
                executeCommand(args.splice(0, 1)[0], args);
            });
        });

    });
});
