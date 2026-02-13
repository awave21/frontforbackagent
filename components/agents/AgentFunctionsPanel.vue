<template>
  <div class="flex h-full bg-white overflow-hidden">
    <!-- Sidebar -->
    <div class="w-[280px] border-r border-slate-200 flex flex-col bg-slate-50">
      <!-- Sidebar Header -->
      <div class="p-4 border-b border-slate-200">
        <div class="flex justify-between items-center mb-3">
          <span class="font-semibold text-sm text-slate-900">Функции</span>
          <div class="flex items-center gap-0.5">
            <button 
              @click="showCurlImport = true" 
              class="text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 p-1 rounded transition-colors"
              title="Импорт из cURL"
            >
              <Terminal class="w-4 h-4" />
            </button>
            <button @click="createFunction" class="text-indigo-600 hover:bg-indigo-50 p-1 rounded transition-colors">
              <Plus class="w-4 h-4" />
            </button>
          </div>
        </div>
        <div class="relative">
          <Search class="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Filter..."
            class="w-full pl-8 pr-3 py-2 text-xs border border-slate-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      </div>
      
      <!-- Function List -->
      <div class="flex-1 overflow-y-auto p-2 space-y-0.5">
        <div 
          v-for="func in functions" 
          :key="func.id"
          class="flex items-center gap-2.5 p-2.5 rounded-md cursor-pointer border border-transparent hover:bg-slate-100 transition-colors"
          :class="{ 'bg-slate-100 border-slate-200': selectedFunction?.id === func.id }"
          @click="selectFunction(func)"
        >
          <span 
            class="text-[9px] font-bold px-1.5 py-0.5 rounded min-w-[38px] text-center uppercase"
            :class="getMethodClass(func.http_method)"
          >
            {{ func.http_method }}
          </span>
          <div class="flex-1 min-w-0">
            <div class="text-[13px] font-medium text-slate-900 truncate flex items-center gap-1">
              {{ func.input_schema?._displayName || func.name || 'Новая функция' }}
              <span v-if="unsavedChanges.has(func.id || '')" class="text-orange-500">●</span>
            </div>
            <div class="text-[11px] text-slate-500 truncate font-mono">{{ func.name || 'function_name' }}</div>
          </div>
          <div class="w-1.5 h-1.5 rounded-full flex-shrink-0" :class="func.status === 'active' ? 'bg-emerald-500' : 'bg-slate-300'"></div>
        </div>
      </div>
    </div>

    <!-- Main Editor -->
    <div class="flex-1 flex flex-col min-w-[460px] bg-white" v-if="selectedFunction">
      <!-- Editor Header -->
      <div class="px-6 py-4 border-b border-slate-200 flex justify-between items-start">
        <div class="flex-1">
          <input
            v-model="displayName"
            @input="onDisplayNameInput"
            type="text"
            placeholder="Название функции (напр: Создать пациента, Get patients)"
            class="text-xl font-semibold text-slate-900 m-0 border-none outline-none bg-transparent w-full placeholder:text-slate-300"
          />
          <div class="flex items-center gap-2 mt-0.5">
            <span class="text-[11px] font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-500 font-normal">
              {{ selectedFunction.name || 'function_name' }}
            </span>
            <span class="text-[11px] font-mono text-slate-300">
              ID: {{ selectedFunction.id }}
            </span>
          </div>
          <div v-if="!selectedFunction.name && !displayName" class="text-[11px] text-slate-400 mt-1">
            Напр: get_patient_list, create_appointment, send_notification
          </div>
          <input
            v-model="selectedFunction.description"
            @input="markAsChanged"
            type="text"
            placeholder="Краткое описание функции"
            class="mt-1.5 text-[13px] text-slate-500 border-none outline-none bg-transparent w-full placeholder:text-slate-300"
          />
        </div>
        <button 
          @click="saveFunction"
          :disabled="!canSave"
          class="p-1.5 rounded-md transition-colors"
          :class="canSave ? 'text-indigo-600 hover:text-indigo-700' : 'text-slate-300 cursor-not-allowed'"
          title="Сохранить"
        >
          <Check class="w-5 h-5" />
        </button>
      </div>

      <!-- Scrollable Content -->
      <div class="flex-1 overflow-y-auto p-6">
        <!-- Config Section -->
          <div class="bg-white border border-slate-200 rounded-lg p-5 mb-6 shadow-sm">
          <div class="text-sm font-semibold mb-4 text-slate-900 flex items-center gap-2">
            <Server class="w-4 h-4 text-indigo-600" />
            Настройка Endpoint
          </div>

          <div class="mb-6">
            <label class="block text-xs font-medium mb-1.5 text-slate-900">URL запроса</label>
            <div class="flex border border-slate-200 rounded-md overflow-hidden bg-white focus-within:ring-1 focus-within:ring-indigo-500 focus-within:border-indigo-500">
              <select 
                v-model="selectedFunction.http_method"
                @change="markAsChanged"
                class="w-[100px] bg-slate-50 border-none border-r border-slate-200 px-3 text-[13px] font-semibold text-slate-900 focus:ring-0 cursor-pointer outline-none"
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="PATCH">PATCH</option>
                <option value="DELETE">DELETE</option>
              </select>
              <input 
                v-model="selectedFunction.endpoint"
                @input="markAsChanged"
                type="text"
                placeholder="https://api.example.com/endpoint"
                class="flex-1 border-none px-3 py-2.5 text-[13px] font-mono text-slate-900 focus:ring-0 outline-none placeholder:text-slate-300"
              />
            </div>
          </div>

          <!-- Tabs -->
          <div class="flex gap-6 border-b border-slate-200 mb-6">
            <button 
              v-for="tab in [
                { id: 'Auth', label: 'Авторизация' },
                { id: 'Body', label: 'Параметры' },
                { id: 'Headers', label: 'Заголовки' },
                { id: 'Response', label: 'Фильтр ответа' }
              ]" 
              :key="tab.id"
              class="pb-2.5 text-[13px] font-medium relative transition-colors"
              :class="activeTab === tab.id ? 'text-slate-900' : 'text-slate-500 hover:text-slate-700'"
              @click="activeTab = tab.id"
            >
              {{ tab.label }}
              <div v-if="activeTab === tab.id" class="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600"></div>
            </button>
          </div>

          <!-- Auth Content -->
          <div v-if="activeTab === 'Auth'">
            <div class="space-y-4">
              <div>
                <label class="block text-xs font-medium mb-1.5 text-slate-900">Тип авторизации</label>
                <select 
                  v-model="selectedFunction.auth_type"
                  @change="markAsChanged"
                  class="w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm"
                >
                  <option value="none">Без авторизации</option>
                  <option value="api_key">API Key</option>
                  <option value="oauth2">OAuth 2.0</option>
                  <option value="service">Service Auth</option>
                </select>
              </div>
              
              <div v-if="selectedFunction.auth_type !== 'none'">
                <label class="block text-xs font-medium mb-1.5 text-slate-900">Credential ID</label>
                <input
                  v-model="selectedFunction.credential_id"
                  @input="markAsChanged"
                  type="text"
                  placeholder="Enter credential ID or leave empty"
                  class="w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm font-mono"
                />
                <p class="mt-1.5 text-xs text-slate-500">
                  Опционально: ID креденшала из системы управления секретами. Оставьте пустым для использования дефолтного.
                </p>
              </div>
            </div>
          </div>

          <!-- Headers Content -->
          <div v-if="activeTab === 'Headers'">
            <div class="text-sm text-slate-500 mb-4">
              Добавьте пользовательские HTTP заголовки к запросу (например, Authorization, X-API-Key, Content-Type).
            </div>
            
            <div v-if="headers.length > 0" class="border border-slate-200 rounded-lg overflow-hidden">
                <table class="w-full">
                  <thead class="bg-slate-50">
                    <tr class="border-b border-slate-200">
                      <th class="text-left px-3 py-2 text-[11px] font-semibold text-slate-500 uppercase w-[35%]">Название</th>
                      <th class="text-left px-3 py-2 text-[11px] font-semibold text-slate-500 uppercase">Значение</th>
                      <th class="w-[36px]"></th>
                    </tr>
                  </thead>
                <tbody @input="onHeaderInput" @change="onHeaderInput" @focusout="autoSave">
                  <tr 
                    v-for="(header, index) in headers" 
                    :key="index"
                    class="border-b border-slate-200 last:border-b-0"
                  >
                    <td class="px-3 py-2">
                      <input
                        v-model="header.key"
                        type="text"
                        placeholder="Authorization"
                        class="w-full px-2 py-1 text-[13px] border border-transparent hover:border-slate-200 focus:border-indigo-500 rounded outline-none"
                      />
                    </td>
                    <td class="px-3 py-2">
                      <input
                        v-model="header.value"
                        type="text"
                        placeholder="Bearer {{token}}"
                        class="w-full px-2 py-1 text-[13px] font-mono text-slate-700 border border-transparent hover:border-slate-200 focus:border-indigo-500 rounded outline-none placeholder:text-slate-400"
                      />
                    </td>
                    <td class="px-3 py-2 text-center">
                      <button 
                        @click="removeHeader(index)"
                        class="text-slate-400 hover:text-red-500 transition-colors"
                      >
                        <X class="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <button 
              @click="addHeader"
              class="mt-3 flex items-center gap-1.5 text-[13px] text-indigo-600 hover:text-indigo-700 font-medium"
            >
              <Plus class="w-3.5 h-3.5" />
              Добавить заголовок
            </button>
          </div>

          <!-- Body Content -->
          <div v-if="activeTab === 'Body'">
            <!-- Header with Content-Type and View Toggle -->
            <div class="flex justify-between items-center mb-4">
              <div class="flex items-center gap-2 text-xs font-medium text-slate-700">
                Content-Type:
                <span class="bg-slate-100 px-2 py-1 rounded text-xs font-mono border border-slate-200">
                  application/json
                </span>
              </div>
              <div class="flex bg-slate-100 rounded-md p-0.5 gap-0.5">
                <button
                  @click="bodyViewMode = 'fields'"
                  class="px-3 py-1 text-xs font-medium rounded transition-all"
                  :class="bodyViewMode === 'fields' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'"
                >
                  Fields
                </button>
                <button
                  @click="bodyViewMode = 'json'"
                  class="px-3 py-1 text-xs font-medium rounded transition-all"
                  :class="bodyViewMode === 'json' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'"
                >
                  JSON
                </button>
              </div>
            </div>

            <!-- Fields View -->
            <div v-if="bodyViewMode === 'fields'">
              <div class="border border-slate-200 rounded-lg overflow-hidden">
                <table class="w-full">
                  <thead class="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th class="text-left px-3 py-2 text-[11px] font-semibold text-slate-500 uppercase w-[25%]">Ключ</th>
                      <th class="text-left px-3 py-2 text-[11px] font-semibold text-slate-500 uppercase w-[15%]">Расположение</th>
                      <th class="text-left px-3 py-2 text-[11px] font-semibold text-slate-500 uppercase w-[15%]">Тип</th>
                      <th class="text-left px-3 py-2 text-[11px] font-semibold text-slate-500 uppercase">Значение</th>
                      <th class="w-[36px]"></th>
                    </tr>
                  </thead>
                  <tbody @input="onBodyParameterInput" @change="onBodyParameterInput" @focusout="autoSave">
                    <tr 
                      v-for="(param, index) in bodyParameters" 
                      :key="index"
                      class="border-b border-slate-200 last:border-b-0"
                    >
                      <td class="px-3 py-2">
                        <input
                          v-model="param.key"
                          type="text"
                          placeholder="parameter_name"
                          class="w-full px-2 py-1 text-[13px] border border-transparent hover:border-slate-200 focus:border-indigo-500 rounded outline-none"
                        />
                      </td>
                      <td class="px-3 py-2">
                        <select
                          v-model="param.location"
                          class="w-full px-2 py-1 text-xs text-slate-700 border-none bg-transparent font-semibold cursor-pointer outline-none"
                        >
                          <option value="body">Body</option>
                          <option value="path">Path</option>
                          <option value="query">Query</option>
                        </select>
                      </td>
                      <td class="px-3 py-2">
                        <select
                          v-model="param.type"
                          class="w-full px-2 py-1 text-xs text-slate-600 border-none bg-transparent font-medium cursor-pointer outline-none"
                        >
                          <option value="string">String</option>
                          <option value="integer">Integer</option>
                          <option value="number">Number</option>
                          <option value="boolean">Boolean</option>
                          <option value="array">Array</option>
                          <option value="object">Object</option>
                        </select>
                      </td>
                      <td class="px-3 py-2">
                        <div class="flex items-start gap-1.5">
                          <!-- Source Toggle: Static / AI -->
                          <button
                            @click="param.fromAI = !param.fromAI; onBodyParameterInput()"
                            class="shrink-0 mt-0.5 px-1.5 py-0.5 text-[10px] font-bold rounded transition-all cursor-pointer select-none"
                            :class="param.fromAI
                              ? 'bg-violet-100 text-violet-700 hover:bg-violet-200'
                              : 'bg-slate-100 text-slate-400 hover:bg-slate-200'"
                            :title="param.fromAI ? 'AI заполняет из контекста диалога. Нажмите для статического значения.' : 'Статическое значение. Нажмите для режима AI.'"
                          >
                            {{ param.fromAI ? 'AI' : '=' }}
                          </button>

                          <!-- Static value input -->
                          <input
                            v-if="!param.fromAI"
                            v-model="param.value"
                            type="text"
                            placeholder="{{variable}}"
                            class="flex-1 px-2 py-1 text-[13px] font-mono text-indigo-600 font-medium border border-transparent hover:border-slate-200 focus:border-indigo-500 rounded outline-none placeholder:text-indigo-300"
                          />

                          <!-- AI configuration -->
                          <div v-else class="flex-1 space-y-1.5">
                            <input
                              v-model="param.aiDescription"
                              @input="onBodyParameterInput"
                              type="text"
                              placeholder="Описание для AI (напр: Имя пользователя)"
                              class="w-full px-2 py-1 text-[13px] text-violet-700 border border-violet-200 bg-violet-50/50 hover:border-violet-300 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 rounded outline-none placeholder:text-violet-300"
                            />
                            <input
                              v-model="param.aiDefaultValue"
                              @input="onBodyParameterInput"
                              type="text"
                              placeholder="По умолчанию (опционально)"
                              class="w-full px-2 py-1 text-[11px] font-mono text-slate-500 border border-transparent hover:border-slate-200 focus:border-slate-400 rounded outline-none placeholder:text-slate-300"
                            />
                          </div>
                        </div>
                      </td>
                      <td class="px-3 py-2 text-center">
                        <button 
                          @click="removeBodyParameter(index)"
                          class="text-slate-400 hover:text-red-500 transition-colors"
                        >
                          <X class="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <button 
                @click="addBodyParameter"
                class="mt-3 flex items-center gap-1.5 text-[13px] text-indigo-600 hover:text-indigo-700 font-medium"
              >
                <Plus class="w-3.5 h-3.5" />
                Добавить поле
              </button>
            </div>

            <!-- JSON View -->
            <div v-if="bodyViewMode === 'json'">
              <textarea
                v-model="bodyJson"
                @input="markAsChanged"
                class="w-full h-[300px] px-3 py-2 border border-slate-200 rounded-lg font-mono text-xs text-slate-900 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none"
                placeholder='{\n  "key": "value"\n}'
              ></textarea>
            </div>
          </div>

          <!-- Response Filter Content -->
          <div v-if="activeTab === 'Response'">
            <!-- Empty State -->
            <div v-if="fieldTree.length === 0" class="p-12 bg-slate-50 rounded-lg border border-dashed border-slate-200 text-center">
              <div class="text-slate-400 mb-2">
                <BrainCircuit class="w-12 h-12 mx-auto mb-3 opacity-50" />
              </div>
              <div class="text-sm text-slate-600 font-medium mb-1">
                Нет данных для фильтрации
              </div>
              <div class="text-xs text-slate-400">
                Запустите тест справа →, чтобы увидеть структуру ответа
              </div>
            </div>

            <!-- Two-Column Layout -->
            <div v-else class="grid grid-cols-2 gap-4">
              <!-- Left Column: Field Selection -->
              <div class="space-y-3">
                <!-- Field Tree -->
                <div class="border border-slate-200 rounded-lg overflow-hidden">
                  <div class="bg-slate-50 px-3 py-2 border-b border-slate-200 text-xs font-semibold text-slate-600">
                    Доступные поля
                  </div>
                  <div class="p-3 max-h-[420px] overflow-y-auto bg-white">
                    <FieldNode 
                      v-for="field in fieldTree" 
                      :key="field.path"
                      :field="field"
                      @toggle="handleToggle"
                    />
                  </div>
                </div>
              </div>

              <!-- Right Column: Live Preview -->
              <div class="space-y-3">
                <!-- Preview -->
                <div class="border border-slate-200 rounded-lg overflow-hidden">
                  <div class="bg-slate-50 px-3 py-2 border-b border-slate-200">
                    <span class="text-xs font-semibold text-slate-600">Превью (что увидит LLM)</span>
                  </div>
                  <div class="bg-slate-900 p-3 max-h-[420px] overflow-auto">
                    <pre class="text-[11px] font-mono text-slate-50 leading-relaxed">{{ JSON.stringify(previewTransformed, null, 2) }}</pre>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- AI Instructions -->
        <div class="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
           <div class="text-sm font-semibold mb-4 text-slate-900 flex items-center gap-2">
            <BrainCircuit class="w-4 h-4 text-indigo-600" />
            Инструкции для AI
          </div>
          <div class="text-[13px] text-slate-500 mb-3">
            Укажите, когда и как AI должен использовать эту функцию.
          </div>
          <textarea
            class="w-full border border-slate-200 rounded-md p-3 text-[13px] min-h-[80px] focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-y"
            placeholder="Используй эту функцию когда..."
          ></textarea>
        </div>
      </div>
    </div>
    <div v-else class="flex-1 flex items-center justify-center text-slate-400 flex-col gap-4">
      <div class="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center">
        <Code class="h-8 w-8 text-slate-400" />
      </div>
      <p>Выберите функцию для редактирования</p>
      <div class="flex items-center gap-3 mt-2">
        <button 
          @click="createFunction"
          class="flex items-center gap-2 px-4 py-2 text-sm font-medium text-indigo-600 border border-indigo-200 rounded-lg hover:bg-indigo-50 transition-colors"
        >
          <Plus class="w-4 h-4" />
          Создать вручную
        </button>
        <button 
          @click="showCurlImport = true"
          class="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Terminal class="w-4 h-4" />
          Импорт из cURL
        </button>
      </div>
    </div>

    <!-- Right Sidebar: Tools -->
    <div class="w-[360px] bg-white border-l border-slate-200 flex flex-col" v-if="selectedFunction">
       <!-- Controls -->
       <div class="px-4 py-3 border-b border-slate-200 flex items-center justify-between bg-white">
         <div class="flex items-center gap-2">
           <span class="text-sm font-medium text-slate-700">{{ selectedFunction.status === 'active' ? 'Активна' : 'Неактивна' }}</span>
           <Switch 
             :model-value="selectedFunction.status === 'active'" 
             @update:model-value="toggleFunctionStatus" 
           />
         </div>
         <div class="flex items-center gap-1">
           <button 
             @click="duplicateFunction" 
             class="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
             title="Дублировать функцию"
           >
             <Copy class="w-4 h-4" />
           </button>
           <button 
             @click="deleteFunction" 
             class="p-2 text-red-500 hover:bg-red-50 rounded-md transition-colors"
             title="Удалить функцию"
           >
             <Trash2 class="w-4 h-4" />
           </button>
         </div>
       </div>

       <!-- Test Console -->
       <div class="flex-1 flex flex-col bg-white min-h-0">
         <div class="h-10 border-b border-slate-200 flex items-center justify-between px-4 bg-slate-50 text-xs font-semibold text-slate-500 uppercase shrink-0">
           <span>Тестовая консоль</span>
           <button 
             @click="testTool"
             :disabled="testing"
             class="flex items-center gap-1.5 bg-indigo-600 text-white px-3 py-1 rounded text-[11px] font-semibold hover:bg-indigo-700 disabled:opacity-50 transition-colors"
           >
             <Play class="w-3 h-3" />
             {{ testing ? 'Выполняется...' : 'Запустить' }}
           </button>
         </div>
         
         <!-- Payload input -->
         <div class="h-20 shrink-0 border-b border-slate-200 relative">
           <textarea 
             v-model="testPayload"
             class="w-full h-full border-none resize-none font-mono text-xs text-slate-900 focus:ring-0 p-3 bg-white"
             placeholder="{}"
           ></textarea>
         </div>

         <!-- Response output -->
         <div class="flex-1 min-h-0 flex flex-col">
           <div 
             class="h-8 flex items-center justify-between px-4 text-[11px] shrink-0"
             :class="testResult 
               ? (testResult.status_code >= 200 && testResult.status_code < 300 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700') 
               : 'bg-slate-50 text-slate-500'"
           >
             <template v-if="testResult">
               <div class="flex items-center gap-2 flex-1 min-w-0">
                 <span class="font-bold">{{ testResult.status_code }}</span>
                 <span>{{ testResult.latency_ms }}ms</span>
                 <span v-if="Array.isArray(testResult.raw_body)" class="opacity-75">
                   {{ testResult.raw_body.length }} эл.
                 </span>
               </div>
               <button @click="testResult = null; fieldTree = []" class="hover:opacity-70 ml-2">
                 <X class="w-3 h-3" />
               </button>
             </template>
             <template v-else>
               <span>Готово</span>
             </template>
           </div>
           <pre 
             v-if="testResult" 
             class="flex-1 p-3 bg-slate-900 text-slate-50 text-xs font-mono overflow-auto min-h-0"
           >{{ JSON.stringify(testResult.raw_body, null, 2) }}</pre>
           <div v-else class="flex-1 flex items-center justify-center text-xs text-slate-400">
             Нажмите Run для выполнения запроса
           </div>
         </div>
       </div>
    </div>
  </div>

  <!-- Status notification -->
  <Transition
    enter-active-class="transition duration-200 ease-out"
    enter-from-class="opacity-0 translate-y-2"
    enter-to-class="opacity-100 translate-y-0"
    leave-active-class="transition duration-150 ease-in"
    leave-from-class="opacity-100 translate-y-0"
    leave-to-class="opacity-0 translate-y-2"
  >
    <div 
      v-if="statusMessage" 
      class="fixed bottom-4 right-4 z-50 px-4 py-2.5 rounded-lg shadow-lg text-sm font-medium flex items-center gap-2"
      :class="statusMessage.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'"
    >
      <Check v-if="statusMessage.type === 'success'" class="w-4 h-4" />
      <X v-else class="w-4 h-4" />
      {{ statusMessage.text }}
    </div>
  </Transition>

  <!-- cURL Import Dialog -->
  <Dialog :open="showCurlImport" @update:open="(v: boolean) => { showCurlImport = v; if (!v) { curlInput = ''; curlError = '' } }">
    <DialogContent class="max-w-2xl">
      <DialogHeader>
        <DialogTitle class="flex items-center gap-2 text-slate-900">
          <Terminal class="w-5 h-5 text-indigo-600" />
          Импорт из cURL
        </DialogTitle>
        <DialogDescription class="text-slate-500">
          Вставьте cURL команду, и мы автоматически заполним URL, метод, заголовки и тело запроса.
        </DialogDescription>
      </DialogHeader>

      <div class="space-y-4 py-2">
        <div>
          <textarea
            v-model="curlInput"
            class="w-full h-[200px] px-4 py-3 border border-slate-200 rounded-lg font-mono text-[13px] text-slate-900 bg-slate-50 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none placeholder:text-slate-400"
            placeholder="curl -X POST https://api.example.com/endpoint \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer token' \
  -d '{&quot;key&quot;: &quot;value&quot;}'"
            @keydown.meta.enter="importFromCurl"
            @keydown.ctrl.enter="importFromCurl"
          ></textarea>
        </div>

        <Transition
          enter-active-class="transition duration-150 ease-out"
          enter-from-class="opacity-0 -translate-y-1"
          enter-to-class="opacity-100 translate-y-0"
          leave-active-class="transition duration-100 ease-in"
          leave-from-class="opacity-100"
          leave-to-class="opacity-0"
        >
          <div v-if="curlError" class="flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            <X class="w-4 h-4 shrink-0" />
            {{ curlError }}
          </div>
        </Transition>

        <div class="flex items-center gap-3 text-xs text-slate-400">
          <div class="flex items-center gap-1.5">
            <kbd class="px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded text-[10px] font-mono text-slate-500">Ctrl</kbd>
            <span>+</span>
            <kbd class="px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded text-[10px] font-mono text-slate-500">Enter</kbd>
            <span class="ml-1">для импорта</span>
          </div>
        </div>
      </div>

      <DialogFooter class="gap-2">
        <DialogClose as-child>
          <button class="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
            Отмена
          </button>
        </DialogClose>
        <button 
          @click="importFromCurl"
          :disabled="!curlInput.trim()"
          class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
        >
          <Terminal class="w-4 h-4" />
          Импортировать
        </button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { 
  Plus, Search, Trash2, Server, BrainCircuit, Code, RefreshCw, Play, X, Check, Copy, Terminal 
} from 'lucide-vue-next'
import Switch from '~/components/ui/switch/Switch.vue'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '~/components/ui/dialog'
import { useApiFetch } from '~/composables/useApiFetch'
import type { Tool, ToolTestResponse, ResponseTransform } from '~/types/tool'
import FieldNode, { type FieldNodeData } from './FieldNode.vue'
import { getReadableErrorMessage } from '~/utils/api-errors'
import { parseCurl } from '~/utils/parse-curl'

// Transliteration map: Cyrillic → Latin (fallback when translation unavailable)
const cyrToLat: Record<string, string> = {
  'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo',
  'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
  'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
  'ф': 'f', 'х': 'kh', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'shch',
  'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya'
}

const toSnakeSlug = (input: string): string =>
  input
    .toLowerCase()
    .split('')
    .map(ch => cyrToLat[ch] ?? ch)
    .join('')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .replace(/_+/g, '_')


// Props
const props = defineProps<{
  agentId: string
}>()

// State
const functions = ref<Tool[]>([])
const displayName = ref('')

const selectedFunction = ref<Tool | null>(null)
const activeTab = ref('Body')
const bodyViewMode = ref<'fields' | 'json'>('fields')
const testing = ref(false)
const testPayload = ref('{}')
const testResult = ref<ToolTestResponse | null>(null)
const fieldTree = ref<FieldNodeData[]>([])
const apiFetch = useApiFetch()
const unsavedChanges = ref<Set<string>>(new Set())
const statusMessage = ref<{ type: 'success' | 'error'; text: string } | null>(null)

// cURL import
const showCurlImport = ref(false)
const curlInput = ref('')
const curlError = ref('')

const showStatus = (type: 'success' | 'error', text: string) => {
  statusMessage.value = { type, text }
  setTimeout(() => { statusMessage.value = null }, 4000)
}

// Body parameters
type BodyParameter = {
  key: string
  location: 'body' | 'path' | 'query'
  type: 'string' | 'integer' | 'number' | 'boolean' | 'array' | 'object'
  value: string
  fromAI: boolean
  aiDescription: string
  aiDefaultValue: string
}
const bodyParameters = ref<BodyParameter[]>([])
const bodyJson = ref('{}')

// Headers
type Header = {
  key: string
  value: string
}
const headers = ref<Header[]>([])

// Computed
const canSave = computed(() => {
  if (!selectedFunction.value?.id) return false
  const func = selectedFunction.value
  const funcId = func.id!
  const hasUnsavedChanges = unsavedChanges.value.has(funcId)
  const isValid = func.name.trim() !== '' && func.endpoint.trim() !== ''
  return hasUnsavedChanges && isValid
})

// Reconstruct bodyParameters from saved input_schema + parameter_mapping
const loadBodyParametersFromSchema = (func: Tool) => {
  const schema = func.input_schema
  const mapping = func.parameter_mapping

  if (!schema?.properties || Object.keys(schema.properties).length === 0) {
    bodyParameters.value = []
    bodyJson.value = '{}'
    return
  }

  bodyParameters.value = Object.entries(schema.properties).map(([key, propSchema]: [string, any]) => {
    const type: BodyParameter['type'] = propSchema.type || 'string'
    const location = (mapping?.[key] || 'body') as BodyParameter['location']

    // Detect AI-filled parameter by x-fromAI flag
    if (propSchema['x-fromAI'] === true) {
      return {
        key,
        location,
        type: type as BodyParameter['type'],
        value: '',
        fromAI: true,
        aiDescription: propSchema.description || '',
        aiDefaultValue: propSchema.default !== undefined
          ? (typeof propSchema.default === 'string' ? propSchema.default : JSON.stringify(propSchema.default))
          : ''
      }
    }

    // Static parameter: restore value from placeholder or default
    let value = ''
    if (propSchema.description?.startsWith('Parameter: ')) {
      const varName = propSchema.description.replace('Parameter: ', '')
      value = `{{${varName}}}`
    } else if (propSchema.default !== undefined) {
      value = typeof propSchema.default === 'string'
        ? propSchema.default
        : JSON.stringify(propSchema.default)
    }

    return {
      key,
      location,
      type: type as BodyParameter['type'],
      value,
      fromAI: false,
      aiDescription: '',
      aiDefaultValue: ''
    }
  })

  syncFieldsToJson()
}

// Methods
let isSelecting = false

const selectFunction = (func: Tool) => {
  isSelecting = true
  
  selectedFunction.value = func
  
  // Restore display name from saved metadata or fall back to slug
  displayName.value = func.input_schema?._displayName || func.name || ''
  
  // Load headers from function (backend field: custom_headers)
  const headersData = (func as any).custom_headers || func.headers
  if (headersData && typeof headersData === 'object') {
    headers.value = Object.entries(headersData).map(([key, value]) => ({ key, value: value as string }))
  } else {
    headers.value = []
  }
  
  // Restore fieldTree from saved response_transform, or reset
  const savedTree = (func.response_transform as any)?._fieldTree
  fieldTree.value = Array.isArray(savedTree) ? savedTree : []
  testResult.value = null
  
  // Load body parameters from schema or reset for new function
  if (func.id?.startsWith('new_')) {
    bodyParameters.value = []
    bodyJson.value = '{}'
    testPayload.value = '{}'
  } else {
    loadBodyParametersFromSchema(func)
    generateTestPayload()
  }
  
  isSelecting = false
}

const markAsChanged = () => {
  if (selectedFunction.value?.id) {
    unsavedChanges.value.add(selectedFunction.value.id)
  }
}

// Auto-generate snake_case slug from display name (transliteration only, no external API)
const onDisplayNameInput = () => {
  if (!selectedFunction.value) return

  selectedFunction.value.name = toSnakeSlug(displayName.value)

  // Persist original display name inside input_schema for reload
  if (selectedFunction.value.input_schema) {
    selectedFunction.value.input_schema._displayName = displayName.value
  }
  markAsChanged()
}

// Auto-save for parameters/headers — triggered on blur and destructive actions
const autoSave = () => {
  if (isSelecting) return
  if (!selectedFunction.value?.id) return
  if (selectedFunction.value.id.startsWith('new_')) return
  saveFunction()
}

// Body parameters management
const addBodyParameter = () => {
  bodyParameters.value.push({
    key: '',
    location: 'body',
    type: 'string',
    value: '',
    fromAI: false,
    aiDescription: '',
    aiDefaultValue: ''
  })
  markAsChanged()
}

const removeBodyParameter = (index: number) => {
  bodyParameters.value.splice(index, 1)
  markAsChanged()
  generateInputSchema()
  generateTestPayload()
  autoSave()
}

// Headers management
const addHeader = () => {
  headers.value.push({
    key: '',
    value: ''
  })
  markAsChanged()
}

const removeHeader = (index: number) => {
  headers.value.splice(index, 1)
  markAsChanged()
  autoSave()
}

// Coerce string value to the correct JS type based on parameter type
const coerceValue = (value: string, type: BodyParameter['type']): any => {
  if (value.startsWith('{{') && value.endsWith('}}')) return value
  switch (type) {
    case 'integer':
    case 'number':
      return Number(value) || 0
    case 'boolean':
      return value === 'true' || value === '1'
    case 'array':
      try { return JSON.parse(value) } catch { return [] }
    case 'object':
      try { return JSON.parse(value) } catch { return {} }
    default:
      return value
  }
}

// Get a type-appropriate default value
const getTypeDefault = (type: BodyParameter['type']): any => {
  switch (type) {
    case 'integer': case 'number': return 0
    case 'boolean': return false
    case 'array': return []
    case 'object': return {}
    default: return ''
  }
}

// Build key-value object from body parameters
const buildParamsObject = (params: BodyParameter[], skipPlaceholders = false): Record<string, any> => {
  const obj: Record<string, any> = {}
  params.forEach(param => {
    if (!param.key) return
    // AI-filled parameter: use default value or type-appropriate empty
    if (param.fromAI) {
      obj[param.key] = param.aiDefaultValue
        ? coerceValue(param.aiDefaultValue, param.type)
        : getTypeDefault(param.type)
      return
    }
    if (skipPlaceholders && param.value.startsWith('{{') && param.value.endsWith('}}')) {
      obj[param.key] = ''
      return
    }
    obj[param.key] = coerceValue(param.value, param.type)
  })
  return obj
}

// Sync body parameters with JSON
const syncFieldsToJson = () => {
  const obj: Record<string, any> = {}
  bodyParameters.value.forEach(param => {
    if (!param.key) return
    if (param.fromAI) {
      // Serialize AI params as $fromAI(key, description, type, defaultValue) expression
      // All 4 positional args must be present if later ones are used
      const key_ = JSON.stringify(param.key)
      const desc = JSON.stringify(param.aiDescription || '')
      const type_ = JSON.stringify(param.type || 'string')
      const def = param.aiDefaultValue ? JSON.stringify(param.aiDefaultValue) : ''
      const parts = def ? [key_, desc, type_, def] : [key_, desc, type_]
      obj[param.key] = `$fromAI(${parts.join(', ')})`
    } else {
      obj[param.key] = coerceValue(param.value, param.type)
    }
  })
  bodyJson.value = JSON.stringify(obj, null, 2)
}

// Parse $fromAI() expression arguments
const parseFromAIExpression = (expr: string): { key: string; description: string; type: string; defaultValue: string } => {
  const inner = expr.slice('$fromAI('.length, -1)
  const args: string[] = []
  let current = ''
  let inString = false
  let escapeNext = false

  for (const ch of inner) {
    if (escapeNext) { current += ch; escapeNext = false; continue }
    if (ch === '\\') { escapeNext = true; current += ch; continue }
    if (ch === '"') { inString = !inString; current += ch; continue }
    if (ch === ',' && !inString) { args.push(current.trim()); current = ''; continue }
    current += ch
  }
  if (current.trim()) args.push(current.trim())

  const unquote = (s: string) => s.startsWith('"') && s.endsWith('"') ? s.slice(1, -1) : s

  return {
    key: args[0] ? unquote(args[0]) : '',
    description: args[1] ? unquote(args[1]) : '',
    type: args[2] ? unquote(args[2]) : 'string',
    defaultValue: args[3] ? unquote(args[3]) : ''
  }
}

const syncJsonToFields = () => {
  try {
    const parsed = JSON.parse(bodyJson.value)
    bodyParameters.value = Object.entries(parsed).map(([key, value]) => {
      // Detect $fromAI() expression
      if (typeof value === 'string' && value.startsWith('$fromAI(') && value.endsWith(')')) {
        const ai = parseFromAIExpression(value)
        return {
          key,
          location: 'body' as const,
          type: (ai.type || 'string') as BodyParameter['type'],
          value: '',
          fromAI: true,
          aiDescription: ai.description,
          aiDefaultValue: ai.defaultValue
        }
      }

      // Regular static parameter
      let type: BodyParameter['type'] = 'string'
      let strValue = String(value)
      
      if (typeof value === 'number') {
        type = Number.isInteger(value) ? 'integer' : 'number'
      } else if (typeof value === 'boolean') {
        type = 'boolean'
      } else if (Array.isArray(value)) {
        type = 'array'
        strValue = JSON.stringify(value)
      } else if (typeof value === 'object' && value !== null) {
        type = 'object'
        strValue = JSON.stringify(value)
      }
      
      return { key, location: 'body' as const, type, value: strValue, fromAI: false, aiDescription: '', aiDefaultValue: '' }
    })
    // Regenerate schema and payload from new fields
    markAsChanged()
    generateInputSchema()
    generateTestPayload()
  } catch (e) {
    console.error('Invalid JSON', e)
  }
}

// Auto-generate test payload from body parameters (placeholders → empty strings for user to fill)
const generateTestPayload = () => {
  testPayload.value = JSON.stringify(buildParamsObject(bodyParameters.value, true), null, 2)
}

// Event handlers for user input — proper Vue 3 pattern instead of deep watchers
const onBodyParameterInput = () => {
  markAsChanged()
  generateInputSchema()
  generateTestPayload()
}

const onHeaderInput = () => {
  markAsChanged()
}

const getMethodClass = (method: string) => {
  switch (method) {
    case 'GET': return 'text-emerald-600 bg-emerald-100'
    case 'POST': return 'text-blue-600 bg-blue-100'
    case 'PUT': return 'text-amber-600 bg-amber-100'
    case 'DELETE': return 'text-red-600 bg-red-100'
    case 'PATCH': return 'text-purple-600 bg-purple-100'
    default: return 'text-slate-600 bg-slate-100'
  }
}

// Build Field Tree from API response
function buildFieldTree(obj: any, prefix = '', parentKey = ''): FieldNodeData[] {
  if (!obj || typeof obj !== 'object') return []
  
  // Если корневой элемент — массив, создаём специальный узел
  if (Array.isArray(obj)) {
    if (obj.length === 0) return []
    
    const arrayNode: FieldNodeData = {
      path: prefix || 'items',
      key: parentKey || `items [${obj.length}]`,
      type: 'array',
      example: `${obj.length} элемент(ов)`,
      selected: true,
      rename: parentKey || 'items',
      children: obj.length > 0 ? buildFieldTree(obj[0], `${prefix}[]`, '') : []
    }
    
    return [arrayNode]
  }
  
  return Object.entries(obj).map(([key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key
    const isArray = Array.isArray(value)
    
    const node: FieldNodeData = {
      path,
      key: isArray ? `${key} [${value.length}]` : key,
      type: isArray ? 'array' : typeof value,
      example: typeof value === 'object' ? undefined : value,
      selected: true,
      rename: key
    }
    
    if (isArray && value.length > 0) {
      // Для массива показываем структуру первого элемента
      node.children = buildFieldTree(value[0], `${path}[]`, key)
    } else if (typeof value === 'object' && value !== null && !isArray) {
      node.children = buildFieldTree(value, path, key)
    }
    
    return node
  })
}

// Apply saved selection state from a previously saved fieldTree onto a fresh one
function applySelectionState(freshNodes: FieldNodeData[], savedNodes: FieldNodeData[]) {
  const savedMap = new Map(savedNodes.map(n => [n.path, n]))
  freshNodes.forEach(node => {
    const saved = savedMap.get(node.path)
    if (saved) {
      node.selected = saved.selected
      if (node.children && saved.children) {
        applySelectionState(node.children, saved.children)
      }
    }
  })
}

// Проверяем, есть ли среди потомков хоть один выбранный
function hasAnySelectedChild(node: FieldNodeData): boolean {
  if (!node.children) return false
  return node.children.some(c => c.selected || hasAnySelectedChild(c))
}

// Generate Response Transform from field tree
function generateResponseTransform(fields: FieldNodeData[]): ResponseTransform {
  const flatFields: FieldNodeData[] = []
  const arrayGroups: Map<string, FieldNodeData[]> = new Map()
  
  const flatten = (nodes: FieldNodeData[]) => {
    nodes.forEach(node => {
      if (node.selected) {
        // Ключевая логика:
        // Если у узла есть ВЫБРАННЫЕ дети — пропускаем родителя.
        // Дети сами попадут в результат и воссоздадут структуру через setNestedValue.
        // Если детей нет или ни один не выбран — добавляем узел как целое значение.
        const skipParent = hasAnySelectedChild(node)
        
        if (!skipParent) {
          if (node.path.includes('[]')) {
            const arrayPath = node.path.split('[]')[0]
            if (!arrayGroups.has(arrayPath)) {
              arrayGroups.set(arrayPath, [])
            }
            arrayGroups.get(arrayPath)!.push(node)
          } else {
            flatFields.push(node)
          }
        }
      }
      
      // ВСЕГДА обходим детей рекурсивно
      if (node.children) {
        flatten(node.children)
      }
    })
  }
  
  flatten(fields)
  
  return {
    mode: 'fields' as const,
    fields: flatFields.map(f => ({
      source: f.path,
      target: f.path  // Всегда полный путь
    })),
    arrays: Array.from(arrayGroups.entries()).map(([source, fields]) => ({
      source,
      target: source.split('.').pop() || 'items',
      fields: fields.map(f => {
        // Путь после [] (например "items[].durationMin.param1" → "durationMin.param1")
        const pathAfterArray = f.path.split('[]')[1]?.slice(1) || f.key
        return {
          source: pathAfterArray,
          target: pathAfterArray  // Всегда полный путь после []
        }
      })
    }))
  }
}

const toggleFunctionStatus = async (isActive: boolean) => {
  if (!selectedFunction.value || selectedFunction.value.id?.startsWith('new_')) return
  
  const newStatus = isActive ? 'active' : 'deprecated'
  
  try {
    await apiFetch(`/tools/${selectedFunction.value.id}`, {
      method: 'PUT',
      body: { status: newStatus }
    })
    
    selectedFunction.value.status = newStatus
    showStatus('success', isActive ? 'Функция активирована' : 'Функция деактивирована')
  } catch (e: any) {
    console.error('Failed to toggle status', e)
    showStatus('error', 'Не удалось изменить статус')
  }
}

const handleToggle = (field: FieldNodeData) => {
  field.selected = !field.selected
  // Каждый элемент переключается независимо
  updateTransform()
}

// Strip example values from fieldTree to keep saved data small
const stripExamples = (nodes: FieldNodeData[]): FieldNodeData[] =>
  nodes.map(n => ({
    ...n,
    example: undefined,
    children: n.children ? stripExamples(n.children) : undefined
  }))

const updateTransform = () => {
  if (selectedFunction.value) {
    const transform = generateResponseTransform(fieldTree.value) as any
    // Persist fieldTree structure so it can be restored after page reload
    transform._fieldTree = stripExamples(fieldTree.value)
    selectedFunction.value.response_transform = transform
    markAsChanged()
  }
}

// Apply transform locally for preview
function resolvePath(obj: any, path: string): any {
  return path.split('.').reduce((curr: any, key: string) => curr?.[key], obj)
}

// Универсальная функция для установки значения по пути
function setNestedValue(obj: any, path: string, value: any) {
  const parts = path.split('.')
  let current = obj
  
  // Создаем вложенную структуру
  for (let i = 0; i < parts.length - 1; i++) {
    if (!current[parts[i]]) {
      current[parts[i]] = {}
    }
    current = current[parts[i]]
  }
  
  // Устанавливаем значение
  current[parts[parts.length - 1]] = value
}

function applyTransformLocally(raw: any, transform: ResponseTransform): any {
  if (transform.mode === 'fields') {
    // Special case: if raw is an array at root level
    if (Array.isArray(raw)) {
      // Find array transform that matches root (items, [] path, etc)
      const rootArrayTransform = transform.arrays?.find(a => 
        a.source === 'items' || a.source === '' || a.source === '[]'
      )
      
      if (rootArrayTransform && rootArrayTransform.fields) {
        return raw.map(item => {
          const newItem: any = {}
          
          rootArrayTransform.fields.forEach(({source: s, target: t}) => {
            // Remove leading [] if present
            const cleanSource = s.replace(/^\[\]\.?/, '')
            const value = cleanSource ? resolvePath(item, cleanSource) : item
            
            // Устанавливаем значение по пути (работает для любой вложенности)
            setNestedValue(newItem, t, value)
          })
          
          return newItem
        })
      }
      
      // If no array transform found, return raw
      return raw
    }
    
    // Normal object case
    const result: any = {}
    
    transform.fields?.forEach(({source, target}) => {
      const value = resolvePath(raw, source)
      setNestedValue(result, target, value)
    })
    
    transform.arrays?.forEach(({source, target, fields}) => {
      const arr = resolvePath(raw, source)
      if (Array.isArray(arr)) {
        result[target] = arr.map(item => {
          const newItem: any = {}
          
          fields.forEach(({source: s, target: t}) => {
            const value = resolvePath(item, s)
            setNestedValue(newItem, t, value)
          })
          
          return newItem
        })
      }
    })
    
    return result
  }
  
  return raw
}

const previewTransformed = computed(() => {
  if (!testResult.value?.raw_body || !selectedFunction.value?.response_transform) {
    return null
  }
  return applyTransformLocally(testResult.value.raw_body, selectedFunction.value.response_transform)
})

// Generate Input Schema and Parameter Mapping from body parameters
const generateInputSchema = () => {
  if (!selectedFunction.value) return
  
  const properties: Record<string, any> = {}
  const required: string[] = []
  const parameterMapping: Record<string, 'path' | 'query' | 'body'> = {}
  
  bodyParameters.value.forEach(param => {
    if (!param.key) return
    
    const schema: any = {}
    
    switch (param.type) {
      case 'string':
        schema.type = 'string'
        break
      case 'integer':
        schema.type = 'integer'
        break
      case 'number':
        schema.type = 'number'
        break
      case 'boolean':
        schema.type = 'boolean'
        break
      case 'array':
        schema.type = 'array'
        schema.items = { type: 'string' }
        break
      case 'object':
        schema.type = 'object'
        break
    }
    
    // AI-filled parameter: LLM must provide this value from conversation context
    if (param.fromAI) {
      schema.description = param.aiDescription || `Value for ${param.key}`
      schema['x-fromAI'] = true
      if (param.aiDefaultValue) {
        schema.default = coerceValue(param.aiDefaultValue, param.type)
      }
      required.push(param.key)
    } else if (param.value) {
      // Static parameter: persist value via JSON Schema `default` field
      if (param.value.startsWith('{{') && param.value.endsWith('}}')) {
        // Placeholder — store in description for AI context
        schema.description = `Parameter: ${param.value.slice(2, -2)}`
      } else {
        // Concrete value — store as schema default
        schema.default = coerceValue(param.value, param.type)
      }
    }
    
    properties[param.key] = schema
    parameterMapping[param.key] = param.location
    
    if (!param.fromAI && param.value && !param.value.startsWith('{{')) {
      required.push(param.key)
    }
  })
  
  selectedFunction.value.input_schema = {
    type: 'object',
    properties,
    ...(required.length > 0 ? { required } : {})
  }
  
  selectedFunction.value.parameter_mapping = Object.keys(parameterMapping).length > 0 
    ? parameterMapping 
    : null
  
  markAsChanged()
}

const testTool = async () => {
  if (!selectedFunction.value) return
  
  testing.value = true
  try {
    let args = {}
    try {
      args = JSON.parse(testPayload.value)
    } catch (e) {
      testResult.value = {
        status_code: 0,
        latency_ms: 0,
        raw_body: { error: 'Invalid JSON in payload' },
        transformed_body: null,
        raw_size_bytes: 0,
        transformed_size_bytes: null,
        error: 'Invalid JSON',
        request_url: selectedFunction.value?.endpoint || '',
        request_method: selectedFunction.value?.http_method || 'POST'
      }
      testing.value = false
      return
    }

    // Build custom_headers object from headers array
    const customHeaders: Record<string, string> = {}
    headers.value.forEach(h => {
      if (h.key.trim()) customHeaders[h.key] = h.value
    })

    // Ensure parameter_mapping is set: if null and we have body params, build it
    let mapping = selectedFunction.value.parameter_mapping
    if (!mapping && bodyParameters.value.length > 0) {
      mapping = {}
      bodyParameters.value.forEach(p => {
        if (p.key) mapping![p.key] = p.location
      })
    }

    const response = await apiFetch<ToolTestResponse>('/tools/test', {
      method: 'POST',
      body: {
        endpoint: selectedFunction.value.endpoint,
        http_method: selectedFunction.value.http_method,
        args: args,
        parameter_mapping: mapping,
        custom_headers: Object.keys(customHeaders).length > 0 ? customHeaders : undefined,
        auth_type: selectedFunction.value.auth_type,
        credential_id: selectedFunction.value.credential_id,
        response_transform: selectedFunction.value.response_transform
      }
    })
    
    testResult.value = response
    
    // Build field tree from response, preserving previous selection state
    if (response.raw_body) {
      const freshTree = buildFieldTree(response.raw_body)
      const savedTree = (selectedFunction.value?.response_transform as any)?._fieldTree
      if (Array.isArray(savedTree) && savedTree.length > 0) {
        applySelectionState(freshTree, savedTree)
      }
      fieldTree.value = freshTree
      updateTransform()
    }
  } catch (error: any) {
    console.error('Test failed:', error)
    // Mock response for UI demonstration if API fails
    testResult.value = {
      status_code: 500,
      latency_ms: 45,
      raw_body: { error: error.message || 'Request failed' },
      transformed_body: null,
      raw_size_bytes: 0,
      transformed_size_bytes: null,
      error: error.message,
      request_url: selectedFunction.value.endpoint,
      request_method: selectedFunction.value.http_method
    }
  } finally {
    testing.value = false
  }
}

// Create Function
const createFunction = () => {
  const newTool: Tool = {
    id: `new_${Date.now()}`,
    name: '',
    description: '',
    endpoint: '',
    http_method: 'POST',
    execution_type: 'http_webhook',
    auth_type: 'none',
    input_schema: {
      type: 'object',
      properties: {}
    },
    parameter_mapping: null,
    response_transform: null,
    headers: null,
    status: 'active',
    version: 1
  }
  
  functions.value.unshift(newTool)
  selectedFunction.value = newTool
  displayName.value = ''
  unsavedChanges.value.add(newTool.id!)
  
  // Reset body parameters
  bodyParameters.value = []
  bodyJson.value = '{}'
}

// Import from cURL — parse cURL and populate a new function
const importFromCurl = () => {
  curlError.value = ''

  const raw = curlInput.value.trim()
  if (!raw) {
    curlError.value = 'Вставьте cURL команду'
    return
  }

  try {
    const parsed = parseCurl(raw)

    if (!parsed.url) {
      curlError.value = 'Не удалось извлечь URL из команды'
      return
    }

    // Create a new function shell
    createFunction()
    if (!selectedFunction.value) return

    // Populate endpoint & method
    selectedFunction.value.endpoint = parsed.url
    selectedFunction.value.http_method = parsed.method

    // Populate auth type
    selectedFunction.value.auth_type = parsed.authType
    if (parsed.authType !== 'none' && parsed.authValue) {
      selectedFunction.value.credential_id = parsed.authValue
    }

    // Populate headers (exclude Content-Type and Authorization which are handled separately)
    const skipHeaders = new Set(['content-type', 'authorization'])
    const importedHeaders: Header[] = Object.entries(parsed.headers)
      .filter(([key]) => !skipHeaders.has(key.toLowerCase()))
      .map(([key, value]) => ({ key, value }))

    // Keep Authorization in headers list if present (user may want to see/edit it)
    const authEntry = Object.entries(parsed.headers).find(([k]) => k.toLowerCase() === 'authorization')
    if (authEntry) {
      importedHeaders.unshift({ key: authEntry[0], value: authEntry[1] })
    }

    headers.value = importedHeaders

    // Populate body parameters from JSON body
    if (parsed.bodyJson && typeof parsed.bodyJson === 'object' && !Array.isArray(parsed.bodyJson)) {
      bodyParameters.value = Object.entries(parsed.bodyJson).map(([key, value]) => {
        let type: BodyParameter['type'] = 'string'
        let strValue = String(value)

        if (typeof value === 'number') {
          type = Number.isInteger(value) ? 'integer' : 'number'
        } else if (typeof value === 'boolean') {
          type = 'boolean'
        } else if (Array.isArray(value)) {
          type = 'array'
          strValue = JSON.stringify(value)
        } else if (typeof value === 'object' && value !== null) {
          type = 'object'
          strValue = JSON.stringify(value)
        }

        return {
          key,
          location: 'body' as const,
          type,
          value: strValue,
          fromAI: false,
          aiDescription: '',
          aiDefaultValue: ''
        }
      })

      generateInputSchema()
      generateTestPayload()
      syncFieldsToJson()
    } else if (parsed.body) {
      // Non-JSON body — put raw data into JSON view
      bodyJson.value = parsed.body
      bodyViewMode.value = 'json'
    }

    // Try to derive a display name from the URL path
    try {
      const urlObj = new URL(parsed.url)
      const pathParts = urlObj.pathname.split('/').filter(Boolean)
      if (pathParts.length > 0) {
        const lastPart = pathParts[pathParts.length - 1]
          .replace(/[^a-zA-Z0-9]/g, '_')
          .replace(/_+/g, '_')
          .toLowerCase()
        const methodPrefix = parsed.method.toLowerCase()
        const suggestedName = `${methodPrefix}_${lastPart}`
        displayName.value = suggestedName
        selectedFunction.value.name = suggestedName
        if (selectedFunction.value.input_schema) {
          selectedFunction.value.input_schema._displayName = suggestedName
        }
      }
    } catch {
      // Invalid URL, skip name derivation
    }

    markAsChanged()

    // Close dialog and reset
    showCurlImport.value = false
    curlInput.value = ''
    showStatus('success', 'Функция импортирована из cURL')
  } catch (e: any) {
    curlError.value = `Ошибка парсинга: ${e.message || 'неверный формат'}`
  }
}

// Duplicate Function — deep-copy all settings, headers, params; give new name
const duplicateFunction = () => {
  if (!selectedFunction.value) return

  const src = selectedFunction.value
  const copyLabel = (src.input_schema?._displayName || src.name || '') + ' (копия)'
  const copySlug = toSnakeSlug(copyLabel)

  // Deep-copy headers from current editor state (already parsed into array)
  const headersCopy: Header[] = headers.value.map(h => ({ key: h.key, value: h.value }))

  // Deep-copy body parameters from current editor state
  const bodyParamsCopy: BodyParameter[] = bodyParameters.value.map(p => ({ ...p }))

  // Deep-copy custom_headers as object for the tool model
  const customHeadersObj: Record<string, string> = {}
  headersCopy.forEach(h => { if (h.key.trim()) customHeadersObj[h.key] = h.value })

  const cloned: Tool = {
    id: `new_${Date.now()}`,
    name: copySlug,
    description: src.description || '',
    endpoint: src.endpoint || '',
    http_method: src.http_method || 'POST',
    execution_type: src.execution_type || 'http_webhook',
    auth_type: src.auth_type || 'none',
    credential_id: src.credential_id,
    input_schema: src.input_schema
      ? JSON.parse(JSON.stringify({ ...src.input_schema, _displayName: copyLabel }))
      : { type: 'object', properties: {} },
    parameter_mapping: src.parameter_mapping
      ? JSON.parse(JSON.stringify(src.parameter_mapping))
      : null,
    response_transform: src.response_transform
      ? JSON.parse(JSON.stringify(src.response_transform))
      : null,
    headers: Object.keys(customHeadersObj).length > 0 ? customHeadersObj : null,
    status: 'active',
    version: 1
  }

  // Also copy custom_headers field used by backend
  if (Object.keys(customHeadersObj).length > 0) {
    ;(cloned as any).custom_headers = customHeadersObj
  }

  functions.value.unshift(cloned)
  unsavedChanges.value.add(cloned.id!)

  // Manually set up the editor state (bypass selectFunction which resets body params for new_ ids)
  isSelecting = true
  selectedFunction.value = cloned
  displayName.value = copyLabel
  headers.value = headersCopy
  bodyParameters.value = bodyParamsCopy
  syncFieldsToJson()
  generateTestPayload()

  // Restore fieldTree from copied response_transform
  const savedTree = (cloned.response_transform as any)?._fieldTree
  fieldTree.value = Array.isArray(savedTree) ? savedTree : []
  testResult.value = null
  isSelecting = false

  showStatus('success', 'Функция дублирована — сохраните для подтверждения')
}

// Save Function
const saveFunction = async () => {
  if (!selectedFunction.value || !canSave.value) return
  
  try {
    const isNew = selectedFunction.value.id?.startsWith('new_')
    
    console.log('💾 Saving with status:', selectedFunction.value.status)
    // Backend model: name, description, input_schema, execution_type, endpoint, auth_type, status
    const payload: Record<string, any> = {
      name: selectedFunction.value.name,
      description: selectedFunction.value.description || '',
      input_schema: selectedFunction.value.input_schema || { type: 'object', properties: {} },
      execution_type: 'http_webhook',
      endpoint: selectedFunction.value.endpoint,
      auth_type: selectedFunction.value.auth_type || 'none',
      status: selectedFunction.value.status || 'active',
    }
    
    // Дополнительные поля (если backend поддерживает)
    if (selectedFunction.value.http_method) {
      payload.http_method = selectedFunction.value.http_method
    }
    
    // Convert headers array to object (backend field: custom_headers)
    if (headers.value.length > 0) {
      payload.custom_headers = headers.value.reduce((obj, h) => {
        if (h.key.trim()) {
          obj[h.key] = h.value
        }
        return obj
      }, {} as Record<string, string>)
    }
    
    // Add response transform if configured
    if (selectedFunction.value.response_transform) {
      payload.response_transform = selectedFunction.value.response_transform
    }
    
    // Add parameter mapping if configured
    if (selectedFunction.value.parameter_mapping) {
      payload.parameter_mapping = selectedFunction.value.parameter_mapping
    }
    
    if (isNew) {
      // Step 1: Create new tool (global for tenant)
      const toolResponse = await apiFetch<Tool>('/tools', { 
        method: 'POST', 
        body: payload 
      })
      
      // Step 2: Bind tool to agent
      await apiFetch(`/agents/${props.agentId}/tools/${toolResponse.id}`, {
        method: 'POST',
        body: {
          permission_scope: 'write',
          credential_id: null
        }
      })
      
      // Remove old temp function from list
      const oldId = selectedFunction.value.id
      const index = functions.value.findIndex(f => f.id === oldId)
      if (index !== -1) {
        // Replace with new function from backend (with real ID)
        functions.value.splice(index, 1, toolResponse)
        // Update selected function reference
        selectedFunction.value = toolResponse
      }
      
      unsavedChanges.value.delete(oldId!)
    } else {
      // Update existing tool
      const response = await apiFetch<Tool>(`/tools/${selectedFunction.value.id}`, { 
        method: 'PUT', 
        body: payload 
      })
      
      // Update in list with response from backend
      const index = functions.value.findIndex(f => f.id === selectedFunction.value?.id)
      if (index !== -1) {
        functions.value.splice(index, 1, response)
        selectedFunction.value = response
      }
      
      unsavedChanges.value.delete(selectedFunction.value.id!)
    }
    
    console.log('💾 Save payload sent:', JSON.stringify(payload, null, 2))
    showStatus('success', 'Функция сохранена')
  } catch (e: any) {
    console.error('Failed to save function', e)
    showStatus('error', `Ошибка сохранения: ${getReadableErrorMessage(e, 'не удалось сохранить функцию')}`)
  }
}

// Delete Function
const deleteFunction = async () => {
  if (!selectedFunction.value) return
  
  const funcName = selectedFunction.value.name || 'Новая функция'
  if (!confirm(`Вы уверены, что хотите удалить функцию "${funcName}"?`)) return
  
  const index = functions.value.findIndex(f => f.id === selectedFunction.value?.id)
  if (index === -1) return
  
  const deletedId = selectedFunction.value.id!
  const isNew = deletedId.startsWith('new_')
  
  try {
    // Unbind from agent (not delete the tool itself, as it may be used by other agents)
    if (!isNew) {
      await apiFetch(`/agents/${props.agentId}/tools/${deletedId}`, { method: 'DELETE' })
    }
    
    // Remove from local list
    functions.value.splice(index, 1)
    if (functions.value.length > 0) {
      selectFunction(functions.value[0])
    } else {
      selectedFunction.value = null
    }
    unsavedChanges.value.delete(deletedId)
    
    showStatus('success', 'Функция удалена')
  } catch (e: any) {
    console.error('Failed to delete function', e)
    showStatus('error', `Ошибка удаления: ${getReadableErrorMessage(e, 'не удалось удалить функцию')}`)
  }
}

// Sync body params ↔ JSON when switching view modes
watch(bodyViewMode, (newMode, oldMode) => {
  if (oldMode === 'fields' && newMode === 'json') {
    syncFieldsToJson()
  } else if (oldMode === 'json' && newMode === 'fields') {
    syncJsonToFields()
  }
})

// Load functions on mount
onMounted(async () => {
  await loadFunctions()
})

const loadFunctions = async () => {
  try {
    // Get bindings with full tool details in one request (N+1 solution)
    // Response: BindingWithTool[] = [{tool_id, permission_scope, tool: {...full tool data...}}]
    const bindings = await apiFetch<any[]>(`/agents/${props.agentId}/tools/details`)
    
    // Extract tools from bindings
    console.log('📦 Raw bindings from backend:', JSON.stringify(bindings[0], null, 2))
    functions.value = bindings
      .map(binding => binding.tool)
      .filter((tool): tool is Tool => tool !== null && tool !== undefined) || []
    console.log('📦 First tool status:', functions.value[0]?.status)
    
    // Select first function if available (use selectFunction to load params/headers)
    if (functions.value.length > 0) {
      selectFunction(functions.value[0])
    }
    
    console.log('📦 Loaded tools from backend:', functions.value.map(f => ({ id: f.id, name: f.name, status: f.status })))
  } catch (e) {
    console.error('Failed to load functions', e)
    // Keep empty array on error
    functions.value = []
  }
}
</script>
