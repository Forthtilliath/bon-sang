import type { EfsSearchResponse } from "./efs";

/** Extrait réel (allégé) d'une réponse `searchbycityname` de l'API EFS. */
export const EFS_SAMPLE_RESPONSE: EfsSearchResponse = {
  samplingLocationEntities_SF: [
    {
      name: "Maison du don",
      city: "31000 Toulouse",
      ville: "Toulouse",
      fullAddress: "7 rue Lapeyrouse Maison du don Lapeyrousse 31000 Toulouse",
      address1: "7 rue Lapeyrouse",
      postCode: "31000",
      latitude: 43.60459518,
      longitude: 1.44662499,
      giveBlood: 1,
      givePlasma: 1,
      givePlatelet: 0,
      horaires: "Du lundi au vendredi : 10h - 19h\nLe samedi : 9h - 17h",
      urlBlood: "https://efs.link/n7yjA",
      isMDD: true,
      id: 327116,
    },
  ],
  samplingLocationCollections: [
    {
      name: "SALLE COMMINGES",
      city: "TOULOUSE",
      ville: null,
      fullAddress: "22 BD DU MARECHAL JUIN 31400 TOULOUSE",
      address2: "22  BD DU MARECHAL JUIN",
      postCode: "31400",
      latitude: 43.58909607,
      longitude: 1.44143033,
      giveBlood: 1,
      givePlasma: 0,
      givePlatelet: 0,
      isMDD: false,
      collections: [
        {
          id: 1130244,
          date: "2026-09-10T00:00:00",
          morningStartTime: "08:30:00",
          morningEndTime: "13:30:00",
          afternoonStartTime: null,
          afternoonEndTime: null,
          isPublishable: true,
          urlBlood: "efs.link/dcjkW",
          nbPlacesRestantesST: 27,
        },
        {
          id: 1130245,
          date: "2026-09-05T00:00:00",
          morningStartTime: "09:00:00",
          morningEndTime: "12:00:00",
          afternoonStartTime: "14:00:00",
          afternoonEndTime: "18:00:00",
          isPublishable: true,
        },
        {
          id: 1130246,
          date: "2026-10-05T00:00:00",
          isPublishable: false,
        },
      ],
    },
  ],
};
