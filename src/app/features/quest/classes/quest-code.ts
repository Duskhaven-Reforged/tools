import { CodeCreator } from '../../../shared/classes/code-creator';
import { ExportOptions } from '../../../types/exportOptions.type';
import { NPCForm } from '../../../types/npcForm.type';
import { POI, Questform } from '../../../types/questform.type';
import { formatID } from '../../../shared/utils/utils';

export class QuestCode extends CodeCreator {
  override values!: Questform;
  override exportOptions!: ExportOptions;
  prevQuest: string = '';

  // Due to quests having the ability to be chained, importSTD will not be checked here

  constructor(
    values: Questform,
    exportOptions: ExportOptions,
    prevQuest: string
  ) {
    super(values, exportOptions);

    this.values = values;
    this.exportOptions = exportOptions;
    this.prevQuest = prevQuest;
  }

  override constructCode() {
    const title = this.values.title;
    if (!title) return { code: '', keyword: '' };

    const objectives = this.constructObjectives();
    const comments = this.constructComments();
    const moduleName = this.values.moduleName;
    const textContent = this.constructTextContent();
    const POIs = this.constructPOIs();
    const questGivers = this.constructQuestGivers();
    const factions = this.constructFactions();
    const level = this.constructLevel();
    const levelRequired = this.constructLevelRequired();
    const flags = this.constructFlags();
    const groupSize = this.constructGroupSize(
      title.split(' ').join('_').toUpperCase()
    );
    const difficulty = this.constructDifficulty();
    const areaSort = this.constructAreaSort();
    const exportKeyword = this.exportOptions.includeExport ? 'export' : '';
    const prevQuestCode = this.constructPrevQuest();
    const nameKeyword = title.split(' ').join('_').toUpperCase();
    const startItem = this.constructStartItem();
    const rewards = this.constructRewards();

    return {
      code: `${comments}${exportKeyword} const ${nameKeyword} = std.Quests.create('${moduleName}', '${title
        .split(' ')
        .join('-')
        .toUpperCase()}')${textContent
        .map((text) => text)
        .join('')} ${objectives
        .map((objective) => objective)
        .join('')} ${POIs.map((poi) => poi).join('')} ${questGivers
        .map((questGiver) => questGiver)
        .join('')}${factions}${level}${levelRequired}${flags
        .map((flag) => flag)
        .join('')} ${difficulty}${areaSort}
      .Name.enGB.set('${title}')${startItem}${rewards}${prevQuestCode}; ${groupSize}`,
      keyword: nameKeyword,
    };
  }

  private constructComments() {
    const designerComments = this.values.designerComments;
    if (!designerComments || designerComments === '') return '';

    return `/*
${designerComments}
*/
`;
  }

  private constructObjectives() {
    const objectiveObj = this.values.objectives;
    if (!objectiveObj) {
      return [''];
    }

    const returnCode: string[] = [];

    objectiveObj.forEach((objective) => {
      if ('objectiveItemID' in objective) {
        const formattedId = formatID(objective.objectiveItemID);

        returnCode.push(`
      .Objectives.Item.add(${formattedId}, ${objective.count})`);
      } else {
        const formattedID = formatID(objective.objectiveCreatureID);

        returnCode.push(`
      .Objectives.Entity.add(${formattedID}, ${objective.count})`);
      }
    });

    return returnCode;
  }

  private constructTextContent() {
    const returnCode = [''];

    // Mapping text types to method names
    const textTypes = [
      { type: 'objectiveText', method: '.ObjectiveText.enGB.set' },
      { type: 'pickupText', method: '.PickupText.enGB.set' },
      { type: 'incompleteText', method: '.IncompleteText.enGB.set' },
      { type: 'completeText', method: '.CompleteText.enGB.set' },
      { type: 'completeLogText', method: '.CompleteLogText.enGB.set' },
    ];

    // Iterate over each text type and append to returnCode if value exists
    textTypes.forEach(({ type, method }) => {
      const textValue = this.values[type as keyof Questform];
      if (textValue) {
        returnCode.push(`
      ${method}(\`${textValue}\`)`);
      }
    });

    return returnCode;
  }

  private constructPOIs() {
    if (!this.values.POIs) {
      return [];
    }

    const returnCode: string[] = [];

    const groupedByObjective = this.values.POIs.reduce((acc, poi) => {
      const key = poi.objective;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(poi);
      return acc;
    }, {} as Record<number, POI[]>);

    Object.entries(groupedByObjective).forEach(([objective, POIs]) => {
      const poiStrings: string[] = [];

      POIs.forEach((poi) =>
        poiStrings.push(
          `
      {x: ${poi.x}, y: ${poi.y}, z: ${poi.z}, o: ${poi.o}, map: ${poi.map}}`
        )
      );

      returnCode.push(`
    .POIs.add(${objective}, [${poiStrings.map((poi) => poi)}])`);
    });

    return returnCode;
  }

  private constructQuestGivers() {
    if (!this.values.questGivers) {
      return [''];
    }

    const returnCode: string[] = [];
    const methodMapping = {
      creaturestarter: '.Questgiver.addCreatureStarter',
      creatureender: '.Questgiver.addCreatureEnder',
      creatureboth: '.Questgiver.addCreatureBoth',
      objectstarter: '.Questgiver.addObjectStarter',
      objectender: '.Questgiver.addObjectEnder',
      objectboth: '.Questgiver.addObjectBoth',
    };

    this.values.questGivers.forEach((questGiver) => {
      const entityType = questGiver.entityType;
      const methodKey = `${entityType}${questGiver.type}`;
      const methodName = methodMapping[methodKey as keyof typeof methodMapping];

      if (methodName) {
        const formattedId = formatID(questGiver.id);
        returnCode.push(`
      ${
        questGiver.commentOut === true ? '/* ' : ''
      }${methodName}(${formattedId})${
          questGiver.commentOut === true ? ' */' : ''
        }`);
      }
    });

    return returnCode;
  }

  private constructFactions() {
    const faction = this.values.faction;

    if (!faction) {
      return '';
    }

    let factionCode = faction.toUpperCase();
    if (factionCode === 'NEUTRAL') factionCode = 'ALL';

    return `
      .RaceMask.${factionCode}.set(true)`;
  }

  private constructLevel() {
    const level = this.values.level;

    if (level === undefined) return '';

    return `
      .QuestLevel.set(${level})`;
  }

  private constructLevelRequired() {
    const levelRequired = this.values.levelRequired;

    return levelRequired === undefined
      ? ''
      : `
      .MinLevel.set(${levelRequired})`;
  }

  private constructFlags(): string[] {
    const { flags } = this.values;

    if (!flags) return [''];

    const flagMap = {
      SHARABLE: flags.sharable,
      PVP: flags.pvp,
      PARTY_ACCEPT: flags.partyAccept,
      STAY_ALIVE: flags.stayAlive,
      DAILY: flags.daily,
      RAID: flags.raid,
      WEEKLY: flags.weekly,
    };

    return Object.entries(flagMap)
      .filter(([_, value]) => value === true)
      .map(
        ([key, value]) => `
      .Flags.${key}.set(${value})`
      );
  }

  private constructGroupSize(titleVar: string) {
    const groupSize = this.values.groupSize;

    return groupSize === undefined || Number(groupSize) === 0
      ? ''
      : `
${titleVar}.row.SuggestedGroupNum.set(${groupSize});`;
  }

  private constructDifficulty() {
    const difficulty = this.values.difficulty;

    return difficulty === undefined
      ? ''
      : `
      .Rewards.Difficulty.set(${difficulty})`;
  }

  private constructAreaSort() {
    const areaSort = this.values.areaSort;
    return areaSort === undefined || areaSort === ''
      ? ''
      : `
      .AreaSort.set(${areaSort})`;
  }

  private constructPrevQuest() {
    if (this.prevQuest === '') return '';

    return `
      .PrevQuest.set(${formatID(this.prevQuest)})`;
  }

  private constructStartItem() {
    return this.values.startItem === undefined || this.values.startItem === ''
      ? ''
      : `
      .StartItem.set(${formatID(this.values.startItem)})`;
  }

  private constructRewards(): string {
    if (!this.values.rewards) return '';

    const { money, reputation, items, titleID, honor, choiceItems } =
      this.values.rewards;

    const rewardLines = [
      money !== 0 ? `.Rewards.Money.set(${money})` : '',
      ...reputation.map(
        (rep) =>
          `.Rewards.Reputation.add(${formatID(rep.factionID)}, ${rep.amount})`
      ),
      ...items.map(
        (item) =>
          `.Rewards.Item.add(${formatID(item.rewardItemID)}, ${item.count})`
      ),
      titleID !== '' ? `.Rewards.Title.set(${formatID(titleID)})` : '',
      honor !== 0 ? `.Rewards.Honor.set(${honor})` : '',
      ...choiceItems.map(
        (item) =>
          `.Rewards.ChoiceItem.add(${formatID(item.rewardItemID)}, ${
            item.count
          })`
      ),
    ].filter(Boolean);

    return rewardLines.length === 0
      ? ''
      : `
      ` + rewardLines.join('\n      ');
  }
}
