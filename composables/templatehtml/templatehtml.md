`<div
  class="export-wrapper"
  style="
    width: 1440px;
    min-height: 812px;
    position: relative;
    font-family: var(--font-family-body);
    background-color: var(--background);
  "
>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link
    href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@100;200;300;400;500;600;700;800;900&family=Geist:wght@100;200;300;400;500;600;700;800;900&family=IBM+Plex+Mono:wght@100;200;300;400;500;600;700&family=IBM+Plex+Sans:wght@100;200;300;400;500;600;700&family=Inter:wght@100;200;300;400;500;600;700;800;900&family=Nunito:wght@200;300;400;500;600;700;800;900&family=PT+Serif:wght@400;700&family=Roboto+Slab:wght@100;200;300;400;500;600;700;800;900&family=Roboto:wght@100;300;400;500;700;900&family=Shantell+Sans:wght@300;400;500;600;700;800&family=Space+Grotesk:wght@300;400;500;600;700&display=swap"
    rel="stylesheet"
  />
  <html>
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Импорт CSV — настройка маппинга (иконки сайдбара)</title>

      <style id="base-styles">
        :root {
          --sidebar-width: 280px;
        }
        * {
          box-sizing: border-box;
        }
        .export-wrapper {
          margin: 0;
          padding: 0;
          min-height: 812px;
          display: flex;
          background-color: var(--background);
          color: var(--foreground);
          font-family: var(
            --font-family-body,
            system-ui,
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            sans-serif
          );
          -webkit-font-smoothing: antialiased;
        }
        .app-container {
          display: flex;
          width: 100%;
          height: 100vh;
          overflow: hidden;
          background-color: var(--muted);
        }
      </style>

      <style id="layout-styles">
        .sidebar-collapsed {
          width: 64px;
          background-color: var(--sidebar);
          border-right: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 12px 0;
          gap: 16px;
          flex-shrink: 0;
        }
        .sidebar-logo {
          width: 32px;
          height: 32px;
          border-radius: var(--radius-lg);
          background-color: var(--sidebar-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--sidebar-primary-foreground);
          font-size: 16px;
          font-weight: 600;
        }
        .sidebar-icons-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-top: 16px;
        }
        .sidebar-icon-item {
          width: 40px;
          height: 40px;
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--sidebar-foreground);
          cursor: pointer;
        }
        .sidebar-icon-item.active {
          background-color: var(--sidebar-primary);
          color: var(--sidebar-primary-foreground);
        }
        .sidebar-bottom-icons {
          margin-top: auto;
          display: flex;
          flex-direction: column;
          gap: 8px;
          align-items: center;
          padding-bottom: 8px;
        }

        .main-area {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          background-color: var(--muted);
        }
        .top-bar {
          height: 60px;
          border-bottom: 1px solid var(--border);
          background-color: var(--background);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 24px;
          flex-shrink: 0;
        }
        .top-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .breadcrumbs {
          font-size: 13px;
          color: var(--muted-foreground);
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 500;
          white-space: nowrap;
        }
        .breadcrumbs span.active {
          color: var(--foreground);
        }
        .top-actions {
          display: flex;
          gap: 12px;
          align-items: center;
        }
        .workspace-wrapper {
          flex: 1;
          display: flex;
          flex-direction: column;
          padding: 24px;
          gap: 20px;
          overflow-y: auto;
          max-width: 1600px;
          margin: 0 auto;
          width: 100%;
        }
        .layout-grid {
          display: grid;
          grid-template-columns: 320px 1fr;
          gap: 24px;
          align-items: start;
        }
      </style>

      <style id="component-styles">
        /* Stepper */
        .stepper-container {
          width: 100%;
          margin-bottom: 8px;
        }
        .stepper {
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: relative;
        }
        .stepper::before {
          content: "";
          position: absolute;
          top: 50%;
          left: 0;
          right: 0;
          height: 2px;
          background-color: var(--border);
          z-index: 0;
          transform: translateY(-50%);
        }
        .step-item {
          position: relative;
          z-index: 1;
          background-color: var(--muted);
          padding: 0 12px;
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
        }
        .step-circle {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background-color: var(--card);
          border: 2px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 600;
          color: var(--muted-foreground);
        }
        .step-label {
          font-size: 13px;
          font-weight: 500;
          color: var(--muted-foreground);
        }
        .step-item.active .step-circle {
          border-color: var(--primary);
          background-color: var(--primary);
          color: var(--primary-foreground);
        }
        .step-item.active .step-label {
          color: var(--foreground);
          font-weight: 600;
        }
        .step-item.completed .step-circle {
          background-color: var(--success);
          border-color: var(--success);
          color: var(--success-foreground);
        }

        /* Cards */
        .card {
          background-color: var(--card);
          border-radius: var(--radius-lg);
          border: 1px solid var(--border);
          overflow: hidden;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
          display: flex;
          flex-direction: column;
        }
        .card-header {
          padding: 16px;
          border-bottom: 1px solid var(--border);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .card-title {
          font-size: 14px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .card-body {
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .card-footer {
          padding: 12px 16px;
          background-color: var(--muted);
          border-top: 1px solid var(--border);
          font-size: 12px;
          color: var(--muted-foreground);
        }

        /* Inputs */
        .input-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .label {
          font-size: 12px;
          font-weight: 500;
          color: var(--foreground);
        }
        .select-box {
          background-color: var(--input);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          padding: 8px 12px;
          font-size: 13px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          cursor: pointer;
        }
        .select-box.type-select {
          height: 32px;
          padding: 4px 10px;
          font-size: 12px;
          border-radius: var(--radius-sm);
          background-color: var(--background);
        }

        /* File Info */
        .file-info-block {
          background-color: var(--muted);
          border-radius: var(--radius-md);
          padding: 12px;
          display: flex;
          gap: 12px;
          align-items: flex-start;
        }
        .file-icon {
          width: 32px;
          height: 32px;
          background-color: var(--background);
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--primary);
          flex-shrink: 0;
        }

        /* Validation List */
        .validation-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .validation-item {
          display: flex;
          gap: 8px;
          align-items: flex-start;
          font-size: 12px;
          color: var(--muted-foreground);
          line-height: 1.4;
          padding: 8px;
          border-radius: var(--radius-md);
          background-color: var(--background);
          border: 1px solid transparent;
        }
        .validation-item.error {
          background-color: rgba(239, 68, 68, 0.05);
          border-color: rgba(239, 68, 68, 0.2);
          color: var(--destructive);
        }
        .validation-item.warning {
          background-color: rgba(245, 158, 11, 0.05);
          border-color: rgba(245, 158, 11, 0.2);
          color: var(--warning-foreground);
        }

        /* Tabs */
        .tabs {
          display: flex;
          gap: 4px;
          border-bottom: 1px solid var(--border);
          padding: 0 16px;
          background-color: var(--background);
        }
        .tab {
          padding: 12px 16px;
          font-size: 13px;
          font-weight: 500;
          color: var(--muted-foreground);
          cursor: pointer;
          border-bottom: 2px solid transparent;
          margin-bottom: -1px;
          white-space: nowrap;
        }
        .tab.active {
          color: var(--primary);
          border-bottom-color: var(--primary);
        }

        /* Table */
        .table-container {
          background-color: var(--card);
          overflow-x: auto;
          overflow-y: auto;
          max-height: 480px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          font-size: 13px;
          min-width: 960px;
        }
        th {
          text-align: left;
          padding: 12px 16px;
          background-color: var(--muted);
          font-weight: 500;
          font-size: 11px;
          text-transform: uppercase;
          color: var(--muted-foreground);
          border-bottom: 1px solid var(--border);
          white-space: nowrap;
        }
        td {
          padding: 12px 16px;
          border-bottom: 1px solid var(--border);
          vertical-align: middle;
        }

        /* Badges */
        .badge {
          display: inline-flex;
          align-items: center;
          padding: 2px 8px;
          border-radius: 999px;
          font-size: 11px;
          font-weight: 500;
          white-space: nowrap;
        }
        .badge-outline {
          border: 1px solid var(--border);
          color: var(--muted-foreground);
        }
        .badge-secondary {
          background-color: var(--secondary);
          color: var(--secondary-foreground);
        }

        /* Mapping specific */
        .arrow-icon {
          color: var(--muted-foreground);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .target-select {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 10px;
          border-radius: 999px;
          background-color: var(--secondary);
          color: var(--secondary-foreground);
          font-size: 12px;
          cursor: pointer;
          width: fit-content;
        }
        .target-select.unmapped {
          background-color: rgba(245, 158, 11, 0.1);
          color: var(--warning-foreground);
          border: 1px solid rgba(245, 158, 11, 0.3);
        }
        .system-name-row {
          display: flex;
          flex-direction: row;
          align-items: center;
          gap: 8px;
          margin-top: 4px;
          font-size: 11px;
          color: var(--muted-foreground);
        }
        .system-name-label {
          white-space: nowrap;
        }
        .system-name-input {
          flex: 1;
          min-width: 0;
          background-color: var(--input);
          border-radius: var(--radius-sm);
          border: 1px solid var(--border);
          padding: 4px 8px;
          font-size: 11px;
          font-family: monospace;
        }

        /* Buttons */
        .btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          height: 36px;
          padding: 0 16px;
          border-radius: var(--radius-md);
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          border: 1px solid transparent;
        }
        .btn-primary {
          background-color: var(--primary);
          color: var(--primary-foreground);
        }
        .btn-ghost {
          background-color: transparent;
          color: var(--muted-foreground);
        }
        .btn-icon-small {
          width: 32px;
          height: 32px;
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: var(--muted);
          color: var(--muted-foreground);
          cursor: pointer;
        }
      </style>
    </head>
    <body>
      <div class="app-container">
        <!-- Collapsed sidebar with icons only -->
        <aside class="sidebar-collapsed" style="cursor: default">
          <div class="sidebar-logo" data-media-type="banani-button">KB</div>

          <div class="sidebar-icons-group">
            <!-- Системный промпт -->
            <div class="sidebar-icon-item" data-media-type="banani-button">
              <iconify-icon
                icon="lucide:file-text"
                style="font-size: 20px"
              ></iconify-icon>
            </div>
            <!-- Каналы -->
            <div class="sidebar-icon-item" data-media-type="banani-button">
              <iconify-icon
                icon="lucide:messages-square"
                style="font-size: 20px"
              ></iconify-icon>
            </div>
            <!-- Интеграции -->
            <div class="sidebar-icon-item" data-media-type="banani-button">
              <iconify-icon
                icon="lucide:blocks"
                style="font-size: 20px"
              ></iconify-icon>
            </div>
            <!-- База знаний (текущий экран) -->
            <div
              class="sidebar-icon-item active"
              data-media-type="banani-button"
            >
              <iconify-icon
                icon="lucide:database"
                style="font-size: 20px"
              ></iconify-icon>
            </div>
            <!-- Функции -->
            <div class="sidebar-icon-item" data-media-type="banani-button">
              <iconify-icon
                icon="lucide:workflow"
                style="font-size: 20px"
              ></iconify-icon>
            </div>
            <!-- Модель -->
            <div class="sidebar-icon-item" data-media-type="banani-button">
              <iconify-icon
                icon="lucide:brain"
                style="font-size: 20px"
              ></iconify-icon>
            </div>
            <!-- Чат -->
            <div class="sidebar-icon-item" data-media-type="banani-button">
              <iconify-icon
                icon="lucide:message-circle"
                style="font-size: 20px"
              ></iconify-icon>
            </div>
          </div>

          <div class="sidebar-bottom-icons">
            <div class="sidebar-icon-item" data-media-type="banani-button">
              <iconify-icon
                icon="lucide:settings"
                style="font-size: 20px"
              ></iconify-icon>
            </div>
            <div class="sidebar-icon-item" data-media-type="banani-button">
              <iconify-icon
                icon="lucide:user"
                style="font-size: 20px"
              ></iconify-icon>
            </div>
          </div>
        </aside>

        <!-- Main Content -->
        <div class="main-area">
          <header class="top-bar">
            <div class="top-left">
              <div class="btn-icon-small" data-media-type="banani-button">
                <iconify-icon
                  icon="lucide:panel-left-open"
                  style="font-size: 18px"
                ></iconify-icon>
              </div>
              <div class="breadcrumbs">
                <span>База знаний</span>
                <iconify-icon
                  icon="lucide:chevron-right"
                  style="font-size: 14px"
                ></iconify-icon>
                <span>Импорт данных</span>
                <iconify-icon
                  icon="lucide:chevron-right"
                  style="font-size: 14px"
                ></iconify-icon>
                <span class="active">Настройка маппинга</span>
              </div>
            </div>
            <div class="top-actions">
              <button class="btn btn-ghost" data-media-type="banani-button">
                <iconify-icon
                  icon="lucide:save"
                  style="font-size: 16px; margin-right: 8px"
                ></iconify-icon>
                Сохранить черновик
              </button>
              <button class="btn btn-primary" data-media-type="banani-button">
                <span>Продолжить</span>
                <iconify-icon
                  icon="lucide:arrow-right"
                  style="font-size: 16px; margin-left: 8px"
                ></iconify-icon>
              </button>
            </div>
          </header>

          <div class="workspace-wrapper">
            <!-- Stepper -->
            <div class="stepper-container">
              <div class="stepper">
                <div
                  class="step-item completed"
                  data-media-type="banani-button"
                >
                  <div class="step-circle">
                    <iconify-icon
                      icon="lucide:check"
                      style="font-size: 16px"
                    ></iconify-icon>
                  </div>
                  <div class="step-label">Загрузка</div>
                </div>
                <div class="step-item active" data-media-type="banani-button">
                  <div class="step-circle">2</div>
                  <div class="step-label">Маппинг</div>
                </div>
                <div class="step-item" data-media-type="banani-button">
                  <div class="step-circle">3</div>
                  <div class="step-label">Проверка</div>
                </div>
                <div class="step-item" data-media-type="banani-button">
                  <div class="step-circle">4</div>
                  <div class="step-label">Импорт</div>
                </div>
              </div>
            </div>

            <div class="layout-grid">
              <!-- Left Column: Context & Controls -->
              <div style="display: flex; flex-direction: column; gap: 24px">
                <!-- File Info Card -->
                <div class="card">
                  <div class="card-header">
                    <div class="card-title">
                      <iconify-icon
                        icon="lucide:file-spreadsheet"
                        style="color: var(--primary)"
                      ></iconify-icon>
                      Источник данных
                    </div>
                    <div class="btn-icon-small" data-media-type="banani-button">
                      <iconify-icon
                        icon="lucide:more-horizontal"
                        style="font-size: 16px"
                      ></iconify-icon>
                    </div>
                  </div>
                  <div class="card-body">
                    <div class="file-info-block">
                      <div class="file-icon">
                        <iconify-icon
                          icon="lucide:table"
                          style="font-size: 18px"
                        ></iconify-icon>
                      </div>
                      <div
                        style="
                          display: flex;
                          flex-direction: column;
                          gap: 2px;
                          overflow: hidden;
                        "
                      >
                        <div
                          style="
                            font-weight: 500;
                            font-size: 13px;
                            white-space: nowrap;
                            overflow: hidden;
                            text-overflow: ellipsis;
                          "
                        >
                          clients_2024.csv
                        </div>
                        <div
                          style="
                            font-size: 11px;
                            color: var(--muted-foreground);
                          "
                        >
                          2.4 МБ · 2413 строк
                        </div>
                      </div>
                    </div>

                    <div class="input-group">
                      <label class="label">Режим импорта</label>
                      <div class="select-box" data-media-type="banani-button">
                        <span>Добавление новых</span>
                        <iconify-icon
                          icon="lucide:chevron-down"
                          style="
                            font-size: 14px;
                            color: var(--muted-foreground);
                          "
                        ></iconify-icon>
                      </div>
                    </div>

                    <div class="input-group">
                      <label class="label">Кодировка</label>
                      <div class="select-box" data-media-type="banani-button">
                        <span>UTF-8 (Авто)</span>
                        <iconify-icon
                          icon="lucide:chevron-down"
                          style="
                            font-size: 14px;
                            color: var(--muted-foreground);
                          "
                        ></iconify-icon>
                      </div>
                    </div>

                    <div class="input-group">
                      <label class="label">Именование полей</label>
                      <div
                        style="
                          font-size: 12px;
                          color: var(--muted-foreground);
                          line-height: 1.4;
                        "
                      >
                        Заголовки в CSV могут быть на кириллице. Система
                        предложит системное имя на латинице, вы можете его
                        отредактировать.
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Validation Status -->
                <div class="card">
                  <div class="card-header">
                    <div class="card-title">
                      <iconify-icon
                        icon="lucide:shield-alert"
                        style="color: var(--warning)"
                      ></iconify-icon>
                      Валидация
                    </div>
                    <span class="badge badge-outline">3 ошибки</span>
                  </div>
                  <div class="card-body">
                    <div class="validation-list">
                      <div class="validation-item error">
                        <iconify-icon
                          icon="lucide:alert-circle"
                          style="
                            font-size: 14px;
                            flex-shrink: 0;
                            margin-top: 2px;
                          "
                        ></iconify-icon>
                        <span
                          >У поля <strong>Телефон</strong> не задано корректное
                          системное имя. Допустимы только латинские буквы, цифры
                          и подчёркивания.</span
                        >
                      </div>
                      <div class="validation-item warning">
                        <iconify-icon
                          icon="lucide:alert-triangle"
                          style="
                            font-size: 14px;
                            flex-shrink: 0;
                            margin-top: 2px;
                          "
                        ></iconify-icon>
                        <span
                          ><strong>Дата визита</strong> не сопоставлена с полем
                          системы. Импорт возможен, но данные не будут
                          сохранены.</span
                        >
                      </div>
                      <div class="validation-item warning">
                        <iconify-icon
                          icon="lucide:info"
                          style="
                            font-size: 14px;
                            flex-shrink: 0;
                            margin-top: 2px;
                          "
                        ></iconify-icon>
                        <span
                          >Некоторые поля используют автоматически
                          сгенерированные имена. Проверьте их перед запуском
                          импорта.</span
                        >
                      </div>
                    </div>
                  </div>
                  <div class="card-footer">Обновлено только что</div>
                </div>
              </div>

              <!-- Right Column: Main Workspace -->
              <div class="card" style="height: 100%; min-height: 600px">
                <div class="tabs">
                  <div class="tab active" data-media-type="banani-button">
                    Настройка полей (Маппинг)
                  </div>
                  <div class="tab" data-media-type="banani-button">
                    Предпросмотр данных
                  </div>
                  <div class="tab" data-media-type="banani-button">
                    JSON схема
                  </div>
                </div>

                <div
                  class="card-body"
                  style="padding: 0; flex: 1; overflow: hidden"
                >
                  <!-- Toolbar -->
                  <div
                    style="
                      padding: 12px 16px;
                      border-bottom: 1px solid var(--border);
                      display: flex;
                      justify-content: space-between;
                      align-items: center;
                    "
                  >
                    <div
                      style="display: flex; flex-direction: column; gap: 6px"
                    >
                      <div
                        style="display: flex; gap: 12px; align-items: center"
                      >
                        <div
                          class="input-group"
                          style="flex-direction: row; align-items: center"
                        >
                          <label
                            style="
                              font-size: 12px;
                              color: var(--muted-foreground);
                              margin-right: 8px;
                            "
                            >Показать:</label
                          >
                          <div
                            class="badge badge-secondary"
                            style="cursor: pointer"
                            data-media-type="banani-button"
                          >
                            Все поля
                          </div>
                          <div
                            class="badge badge-outline"
                            style="border: none; cursor: pointer"
                            data-media-type="banani-button"
                          >
                            Только ошибки
                          </div>
                        </div>
                      </div>
                      <div
                        style="font-size: 11px; color: var(--muted-foreground)"
                      >
                        Системное имя используется в схемах, API и правилах.
                        Только латиница, цифры и _. Пример:
                        <span style="font-family: monospace"
                          >client_full_name</span
                        >
                      </div>
                    </div>
                    <button
                      class="btn btn-ghost"
                      style="height: 32px; font-size: 12px"
                      data-media-type="banani-button"
                    >
                      <iconify-icon
                        icon="lucide:wand-2"
                        style="font-size: 14px; margin-right: 6px"
                      ></iconify-icon>
                      Сгенерировать имена
                    </button>
                  </div>

                  <!-- Table Grid -->
                  <div
                    class="table-container"
                    style="flex: 1; overflow-y: auto"
                  >
                    <table>
                      <thead>
                        <tr>
                          <th style="width: 40px">
                            <iconify-icon
                              icon="lucide:check-square"
                              style="font-size: 14px"
                            ></iconify-icon>
                          </th>
                          <th style="width: 26%">
                            Заголовок в CSV (кириллица)
                          </th>
                          <th style="width: 26%">Системное имя (латиница)</th>
                          <th style="width: 40px"></th>
                          <th style="width: 24%">Целевое поле</th>
                          <th>Тип содержимого</th>
                          <th style="width: 40px"></th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td style="text-align: center">
                            <input
                              type="checkbox"
                              checked=""
                              style="accent-color: var(--primary)"
                            />
                          </td>
                          <td>
                            <div
                              style="
                                display: flex;
                                flex-direction: column;
                                gap: 4px;
                              "
                            >
                              <span style="font-size: 13px; font-weight: 500"
                                >ФИО клиента</span
                              >
                              <span
                                style="
                                  font-size: 11px;
                                  color: var(--muted-foreground);
                                "
                                >Пример: "Иван Иванов"</span
                              >
                            </div>
                          </td>
                          <td>
                            <div class="system-name-row">
                              <span class="system-name-label">Системное:</span>
                              <div class="system-name-input">
                                client_full_name
                              </div>
                              <span
                                class="badge badge-outline"
                                style="font-size: 9px"
                                >auto</span
                              >
                            </div>
                          </td>
                          <td>
                            <div class="arrow-icon">
                              <iconify-icon
                                icon="lucide:arrow-right"
                                style="font-size: 16px"
                              ></iconify-icon>
                            </div>
                          </td>
                          <td>
                            <div
                              class="target-select"
                              data-media-type="banani-button"
                            >
                              <iconify-icon
                                icon="lucide:user"
                                style="font-size: 12px"
                              ></iconify-icon>
                              <span>Client Name</span>
                              <iconify-icon
                                icon="lucide:chevron-down"
                                style="font-size: 12px; opacity: 0.5"
                              ></iconify-icon>
                            </div>
                          </td>
                          <td>
                            <div
                              class="select-box type-select"
                              data-media-type="banani-button"
                            >
                              <span>текст</span>
                              <iconify-icon
                                icon="lucide:chevron-down"
                                style="
                                  font-size: 14px;
                                  color: var(--muted-foreground);
                                "
                              ></iconify-icon>
                            </div>
                          </td>
                          <td>
                            <div
                              class="btn-icon-small"
                              data-media-type="banani-button"
                            >
                              <iconify-icon
                                icon="lucide:settings-2"
                                style="font-size: 14px"
                              ></iconify-icon>
                            </div>
                          </td>
                        </tr>

                        <tr style="background-color: rgba(239, 68, 68, 0.02)">
                          <td style="text-align: center">
                            <input
                              type="checkbox"
                              checked=""
                              style="accent-color: var(--primary)"
                            />
                          </td>
                          <td>
                            <div
                              style="
                                display: flex;
                                flex-direction: column;
                                gap: 4px;
                              "
                            >
                              <span style="font-size: 13px; font-weight: 500"
                                >Телефон</span
                              >
                              <span
                                style="
                                  font-size: 11px;
                                  color: var(--muted-foreground);
                                "
                                >Пример: "+7999000..."</span
                              >
                            </div>
                          </td>
                          <td>
                            <div class="system-name-row">
                              <span class="system-name-label">Системное:</span>
                              <div
                                class="system-name-input"
                                style="
                                  border-color: var(--destructive);
                                  color: var(--destructive);
                                "
                              >
                                телефон
                              </div>
                              <iconify-icon
                                icon="lucide:alert-circle"
                                style="
                                  font-size: 14px;
                                  color: var(--destructive);
                                "
                              ></iconify-icon>
                            </div>
                            <div
                              style="
                                margin-top: 4px;
                                font-size: 10px;
                                color: var(--destructive);
                              "
                            >
                              Только латиница и _ , попробуйте
                              <span style="font-family: monospace">phone</span>
                            </div>
                          </td>
                          <td>
                            <div class="arrow-icon">
                              <iconify-icon
                                icon="lucide:arrow-right"
                                style="font-size: 16px"
                              ></iconify-icon>
                            </div>
                          </td>
                          <td>
                            <div
                              class="target-select"
                              data-media-type="banani-button"
                            >
                              <iconify-icon
                                icon="lucide:phone"
                                style="font-size: 12px"
                              ></iconify-icon>
                              <span>Phone</span>
                              <iconify-icon
                                icon="lucide:chevron-down"
                                style="font-size: 12px; opacity: 0.5"
                              ></iconify-icon>
                            </div>
                          </td>
                          <td>
                            <div
                              class="select-box type-select"
                              data-media-type="banani-button"
                            >
                              <span>текст</span>
                              <iconify-icon
                                icon="lucide:chevron-down"
                                style="
                                  font-size: 14px;
                                  color: var(--muted-foreground);
                                "
                              ></iconify-icon>
                            </div>
                          </td>
                          <td>
                            <div
                              class="btn-icon-small"
                              data-media-type="banani-button"
                            >
                              <iconify-icon
                                icon="lucide:settings-2"
                                style="font-size: 14px"
                              ></iconify-icon>
                            </div>
                          </td>
                        </tr>

                        <tr style="background-color: rgba(245, 158, 11, 0.02)">
                          <td style="text-align: center">
                            <input
                              type="checkbox"
                              checked=""
                              style="accent-color: var(--primary)"
                            />
                          </td>
                          <td>
                            <div
                              style="
                                display: flex;
                                flex-direction: column;
                                gap: 4px;
                              "
                            >
                              <span style="font-size: 13px; font-weight: 500"
                                >Категория услуги</span
                              >
                              <span
                                style="
                                  font-size: 11px;
                                  color: var(--muted-foreground);
                                "
                                >Пример: "Массаж"</span
                              >
                            </div>
                          </td>
                          <td>
                            <div class="system-name-row">
                              <span class="system-name-label">Системное:</span>
                              <div class="system-name-input">
                                service_category
                              </div>
                              <span
                                class="badge badge-outline"
                                style="font-size: 9px"
                                >auto</span
                              >
                            </div>
                          </td>
                          <td>
                            <div class="arrow-icon">
                              <iconify-icon
                                icon="lucide:arrow-right"
                                style="font-size: 16px"
                              ></iconify-icon>
                            </div>
                          </td>
                          <td>
                            <div
                              class="target-select unmapped"
                              data-media-type="banani-button"
                            >
                              <iconify-icon
                                icon="lucide:alert-circle"
                                style="font-size: 12px"
                              ></iconify-icon>
                              <span>Выбрать поле...</span>
                            </div>
                          </td>
                          <td>
                            <div
                              class="select-box type-select"
                              data-media-type="banani-button"
                            >
                              <span>текст</span>
                              <iconify-icon
                                icon="lucide:chevron-down"
                                style="
                                  font-size: 14px;
                                  color: var(--muted-foreground);
                                "
                              ></iconify-icon>
                            </div>
                          </td>
                          <td>
                            <div
                              class="btn-icon-small"
                              data-media-type="banani-button"
                            >
                              <iconify-icon
                                icon="lucide:settings-2"
                                style="font-size: 14px"
                              ></iconify-icon>
                            </div>
                          </td>
                        </tr>

                        <tr>
                          <td style="text-align: center">
                            <input
                              type="checkbox"
                              style="accent-color: var(--primary)"
                            />
                          </td>
                          <td style="opacity: 0.6">
                            <div
                              style="
                                display: flex;
                                flex-direction: column;
                                gap: 4px;
                              "
                            >
                              <span
                                style="
                                  font-size: 13px;
                                  font-weight: 500;
                                  text-decoration: line-through;
                                "
                                >Внутренний ID</span
                              >
                              <span
                                style="
                                  font-size: 11px;
                                  color: var(--muted-foreground);
                                "
                                >Пример: "XP-992"</span
                              >
                            </div>
                          </td>
                          <td>
                            <div class="system-name-row" style="opacity: 0.5">
                              <span class="system-name-label">Системное:</span>
                              <div class="system-name-input">internal_id</div>
                            </div>
                          </td>
                          <td>
                            <div class="arrow-icon" style="opacity: 0.3">
                              <iconify-icon
                                icon="lucide:arrow-right"
                                style="font-size: 16px"
                              ></iconify-icon>
                            </div>
                          </td>
                          <td>
                            <span
                              style="
                                font-size: 12px;
                                color: var(--muted-foreground);
                              "
                              >Не импортировать</span
                            >
                          </td>
                          <td>
                            <div
                              class="select-box type-select"
                              style="opacity: 0.4"
                              data-media-type="banani-button"
                            >
                              <span>—</span>
                              <iconify-icon
                                icon="lucide:chevron-down"
                                style="
                                  font-size: 14px;
                                  color: var(--muted-foreground);
                                "
                              ></iconify-icon>
                            </div>
                          </td>
                          <td>
                            <div
                              class="btn-icon-small"
                              data-media-type="banani-button"
                            >
                              <iconify-icon
                                icon="lucide:plus"
                                style="font-size: 14px"
                              ></iconify-icon>
                            </div>
                          </td>
                        </tr>

                        <tr>
                          <td style="text-align: center">
                            <input
                              type="checkbox"
                              checked=""
                              style="accent-color: var(--primary)"
                            />
                          </td>
                          <td>
                            <div
                              style="
                                display: flex;
                                flex-direction: column;
                                gap: 4px;
                              "
                            >
                              <span style="font-size: 13px; font-weight: 500"
                                >Стоимость визита</span
                              >
                              <span
                                style="
                                  font-size: 11px;
                                  color: var(--muted-foreground);
                                "
                                >Пример: "5000"</span
                              >
                            </div>
                          </td>
                          <td>
                            <div class="system-name-row">
                              <span class="system-name-label">Системное:</span>
                              <div class="system-name-input">visit_cost</div>
                              <span
                                class="badge badge-outline"
                                style="font-size: 9px"
                                >auto</span
                              >
                            </div>
                          </td>
                          <td>
                            <div class="arrow-icon">
                              <iconify-icon
                                icon="lucide:arrow-right"
                                style="font-size: 16px"
                              ></iconify-icon>
                            </div>
                          </td>
                          <td>
                            <div
                              class="target-select"
                              data-media-type="banani-button"
                            >
                              <iconify-icon
                                icon="lucide:dollar-sign"
                                style="font-size: 12px"
                              ></iconify-icon>
                              <span>Price</span>
                              <iconify-icon
                                icon="lucide:chevron-down"
                                style="font-size: 12px; opacity: 0.5"
                              ></iconify-icon>
                            </div>
                          </td>
                          <td>
                            <div
                              class="select-box type-select"
                              data-media-type="banani-button"
                            >
                              <span>число</span>
                              <iconify-icon
                                icon="lucide:chevron-down"
                                style="
                                  font-size: 14px;
                                  color: var(--muted-foreground);
                                "
                              ></iconify-icon>
                            </div>
                          </td>
                          <td>
                            <div
                              class="btn-icon-small"
                              data-media-type="banani-button"
                            >
                              <iconify-icon
                                icon="lucide:settings-2"
                                style="font-size: 14px"
                              ></iconify-icon>
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <!-- Add Field Button -->
                  <div
                    style="
                      padding: 12px 16px;
                      border-top: 1px solid var(--border);
                      display: flex;
                      justify-content: space-between;
                      align-items: center;
                    "
                  >
                    <button
                      class="btn btn-ghost"
                      style="font-size: 12px; padding-left: 0"
                      data-media-type="banani-button"
                    >
                      <iconify-icon
                        icon="lucide:plus"
                        style="font-size: 14px; margin-right: 6px"
                      ></iconify-icon>
                      Добавить вычисляемое поле
                    </button>
                    <div
                      style="
                        font-size: 11px;
                        color: var(--muted-foreground);
                        white-space: nowrap;
                      "
                    >
                      Типы: текст, многострочный текст, число, дата/время
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </body>
  </html>
  <script src="https://code.iconify.design/iconify-icon/3.0.0/iconify-icon.min.js"></script>
  <style>
    :root {
      --background: #f7f8fb;
      --foreground: #0f1724;
      --border: #e6e9f0;
      --input: #ffffff;
      --primary: #6b46ff;
      --primary-foreground: #ffffff;
      --secondary: #eef2ff;
      --secondary-foreground: #5b21b6;
      --muted: #f1f3f8;
      --muted-foreground: #8b92a6;
      --success: #10b981;
      --success-foreground: #ffffff;
      --accent: #6b46ff;
      --accent-foreground: #ffffff;
      --destructive: #ef4444;
      --destructive-foreground: #ffffff;
      --warning: #f59e0b;
      --warning-foreground: #0f1724;
      --card: #ffffff;
      --card-foreground: #0f1724;
      --sidebar: #ffffff;
      --sidebar-foreground: #475569;
      --sidebar-primary: #eef2ff;
      --sidebar-primary-foreground: #5b21b6;
      --radius-sm: 4px;
      --radius-md: 6px;
      --radius-lg: 8px;
      --radius-xl: 12px;
      --font-family-body: Inter;
    }
  </style>
</div>
`