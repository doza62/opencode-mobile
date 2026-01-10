// AI model management and selection
import { useState, useCallback, useEffect } from "react";
import { apiClient } from "@/shared/services/api/client";
import { storage } from "@/shared/services/storage";
import { STORAGE_KEYS } from "@/shared/constants/storage";
import { logger } from "@/shared/services/logger";

const modelLogger = logger.tag('Model');

export const useModelManager = (baseUrl, selectedProject) => {
  const [providers, setProviders] = useState([]);
  const [selectedModel, setSelectedModel] = useState(null);
  const [loading, setLoading] = useState(false);

   const loadModels = useCallback(async () => {
     if (!baseUrl || !selectedProject) return;

     setLoading(true);
     try {
       const response = await apiClient.get(
         `${baseUrl}/config/providers`,
         {},
         selectedProject,
       );
       const data = await apiClient.parseJSON(response);

       const providersList = data.providers || [];
       const providerSummary = providersList.map(e => ({ id: e.id, name: e.name }));
       modelLogger.debug('Loaded model providers', { count: providersList.length, providers: providerSummary });

       setProviders(providersList);

       const lastModel = await storage.get(STORAGE_KEYS.LAST_SELECTED_MODEL);
       if (lastModel) {
         setSelectedModel(lastModel);
       } else if (data.default && Object.keys(data.default).length > 0) {
         const defaultProvider = Object.keys(data.default)[0];
         const defaultModel = data.default[defaultProvider];
         setSelectedModel({
           providerId: defaultProvider,
           modelId: defaultModel,
         });
       }
     } catch (error) {
       modelLogger.error('Failed to load models', error);
       setProviders([]);
     } finally {
       setLoading(false);
     }
   }, [baseUrl, selectedProject]);

  useEffect(() => {
    loadModels();
  }, [loadModels]);

  // Select a model and save preference
  const selectModel = useCallback(async (providerId, modelId) => {
    const newModel = { providerId, modelId };
    setSelectedModel(newModel);

    // Save to storage
    await storage.set(STORAGE_KEYS.LAST_SELECTED_MODEL, {
      ...newModel,
      timestamp: Date.now(),
    });
  }, []);

  return {
    providers,
    selectedModel,
    loading,
    loadModels,
    selectModel,
  };
};
