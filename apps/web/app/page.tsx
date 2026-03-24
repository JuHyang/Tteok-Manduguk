"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import styles from "./page.module.css";

type Bowl = {
  id: number;
  hasSoup: boolean;
  ingredients: string[];
  extracted: boolean;
};

type ActionId =
  | "place"
  | "newBowl"
  | "takeSoup"
  | "takeRicecake"
  | "takeDumpling"
  | "pickSoup"
  | "pickRicecakeFromBowl"
  | "pickDumplingFromBowl"
  | "submit"
  | "throw";

type HandItem =
  | { kind: "bowl"; bowl: Bowl }
  | { kind: "soup" }
  | { kind: "ingredient"; name: string };

const MAX_BOWLS = 5;
const MAX_HAND = 5;

const baseRecipes = ["떡국", "만두국", "떡만두국", "만두떡국"];

const defaultRecipe = baseRecipes[0] ?? "떡국";

const actions: { id: ActionId; label: string; hint: string }[] = [
  { id: "place", label: "놓는다", hint: "손 슬롯 → 테이블 슬롯" },
  { id: "newBowl", label: "그릇을 꺼낸다", hint: "손에 그릇 추가" },
  { id: "takeSoup", label: "국을 꺼낸다", hint: "손에 국 추가" },
  { id: "takeRicecake", label: "떡 가져오기", hint: "손에 떡 추가" },
  { id: "takeDumpling", label: "만두 가져오기", hint: "손에 만두 추가" },
  {
    id: "pickRicecakeFromBowl",
    label: "그릇에서 떡 꺼내기",
    hint: "국에서 떡 추출",
  },
  {
    id: "pickDumplingFromBowl",
    label: "그릇에서 만두 꺼내기",
    hint: "국에서 만두 추출",
  },
  {
    id: "pickSoup",
    label: "국 그릇 집기",
    hint: "국 그릇을 손에",
  },
  { id: "submit", label: "제시하기", hint: "레시피 제출" },
  { id: "throw", label: "버리기", hint: "선택 손 슬롯 버리기" },
];

const createBowl = (id: number): Bowl => ({
  id,
  hasSoup: false,
  ingredients: [],
  extracted: false,
});

const getIngredientType = (item?: string) => {
  if (!item) return "";
  if (item.endsWith("떡")) return "떡";
  if (item.endsWith("만두")) return "만두";
  if (item.endsWith("국")) return "국";
  return item;
};

const isSoup = (bowl: Bowl) => bowl.hasSoup;

const getSoupName = (bowl: Bowl) => {
  if (!bowl.hasSoup) return "빈 그릇";
  if (bowl.ingredients.length === 0) return "국";
  return `${bowl.ingredients.join("")}국`;
};

const buildRecipePool = () => {
  const extracted: string[] = [];
  baseRecipes.forEach((soup) => {
    extracted.push(`${soup}떡`);
    extracted.push(`${soup}만두`);
  });
  return [...baseRecipes, ...extracted];
};

const removeLastMatching = (items: string[], type: string) => {
  for (let i = items.length - 1; i >= 0; i -= 1) {
    if (getIngredientType(items[i]) === type) {
      const copy = [...items];
      copy.splice(i, 1);
      return copy;
    }
  }
  return items;
};

const findEmptySlot = (hand: Array<HandItem | null>) =>
  hand.findIndex((item) => item === null);

const getHandLabel = (item: HandItem) => {
  if (item.kind === "soup") return "국";
  if (item.kind === "ingredient") return item.name;
  const bowl = item.bowl;
  if (bowl.hasSoup) return getSoupName(bowl);
  return "빈 그릇";
};

export default function Home() {
  const nextId = useRef(1);
  const [tableSlots, setTableSlots] = useState<Array<Bowl | null>>(() =>
    Array.from({ length: MAX_BOWLS }, () => null),
  );
  const [selectedTableSlot, setSelectedTableSlot] = useState(0);
  const [selectedAction, setSelectedAction] = useState(0);
  const [selectedSlot, setSelectedSlot] = useState(0);
  const [handSlots, setHandSlots] = useState<Array<HandItem | null>>(() =>
    Array.from({ length: MAX_HAND }, () => null),
  );
  const recipePool = useMemo(() => buildRecipePool(), []);
  const [recipe, setRecipe] = useState<string>(recipePool[0] ?? defaultRecipe);
  const [log, setLog] = useState<string[]>([
    "시작! 그릇을 꺼내고 레시피를 완성해봐.",
  ]);

  const selectedBowl = tableSlots[selectedTableSlot];
  const handCount = useMemo(
    () => handSlots.filter((item) => item !== null).length,
    [handSlots],
  );

  const nextRecipe = useMemo<string>(() => {
    const candidates = recipePool.filter((item) => item !== recipe);
    if (candidates.length === 0) return recipe;
    const next = candidates[Math.floor(Math.random() * candidates.length)];
    return next ?? recipe;
  }, [recipe, recipePool]);

  const pushLog = (message: string) => {
    setLog((prev) => [message, ...prev].slice(0, 6));
  };

  const runAction = (actionId: ActionId) => {
    if (actionId === "newBowl") {
      const emptyIndex = findEmptySlot(handSlots);
      if (emptyIndex < 0) {
        pushLog("손이 가득 찼어. (최대 5개)");
        return;
      }
      const newBowl = createBowl(nextId.current++);
      setHandSlots((prev) =>
        prev.map((item, index) =>
          index === emptyIndex ? { kind: "bowl", bowl: newBowl } : item,
        ),
      );
      pushLog("그릇을 꺼냈다.");
      return;
    }

    if (actionId === "takeSoup") {
      const emptyIndex = findEmptySlot(handSlots);
      if (emptyIndex < 0) {
        pushLog("손이 가득 찼어. (최대 5개)");
        return;
      }
      setHandSlots((prev) =>
        prev.map((item, index) =>
          index === emptyIndex ? { kind: "soup" } : item,
        ),
      );
      pushLog("국을 꺼냈다.");
      return;
    }

    if (actionId === "takeRicecake" || actionId === "takeDumpling") {
      const emptyIndex = findEmptySlot(handSlots);
      if (emptyIndex < 0) {
        pushLog("손이 가득 찼어. (최대 5개)");
        return;
      }
      const name = actionId === "takeRicecake" ? "떡" : "만두";
      setHandSlots((prev) =>
        prev.map((item, index) =>
          index === emptyIndex ? { kind: "ingredient", name } : item,
        ),
      );
      pushLog(`${name}를 꺼냈다.`);
      return;
    }

    if (actionId === "throw") {
      const item = handSlots[selectedSlot];
      if (!item) {
        pushLog("버릴 게 없어.");
        return;
      }
      setHandSlots((prev) =>
        prev.map((slotItem, index) =>
          index === selectedSlot ? null : slotItem,
        ),
      );
      pushLog("손에 든 것을 버렸다.");
      return;
    }

    if (
      actionId === "pickSoup" ||
      actionId === "pickRicecakeFromBowl" ||
      actionId === "pickDumplingFromBowl"
    ) {
      if (!selectedBowl) {
        pushLog("선택된 그릇이 없어.");
        return;
      }
      if (!isSoup(selectedBowl)) {
        pushLog("국 그릇이 선택되어야 해.");
        return;
      }
      const emptyIndex = findEmptySlot(handSlots);
      if (emptyIndex < 0) {
        pushLog("손이 가득 찼어. (최대 5개)");
        return;
      }

      if (actionId === "pickSoup") {
        setHandSlots((prev) =>
          prev.map((item, index) =>
            index === emptyIndex ? { kind: "bowl", bowl: selectedBowl } : item,
          ),
        );
        setTableSlots((prev) =>
          prev.map((bowl, index) =>
            index === selectedTableSlot ? null : bowl,
          ),
        );
        pushLog(`${getSoupName(selectedBowl)}을/를 손에 넣었다.`);
        return;
      }

      if (selectedBowl.extracted) {
        pushLog("이 그릇은 국 이었던것이야. 떡/만두는 꺼낼 수 없어.");
        return;
      }

      const ingredientTarget =
        actionId === "pickRicecakeFromBowl" ? "떡" : "만두";
      const hasType = selectedBowl.ingredients.some(
        (item) => getIngredientType(item) === ingredientTarget,
      );
      if (!hasType) {
        pushLog(`${ingredientTarget}가 들어 있지 않아.`);
        return;
      }
      const soupName = getSoupName(selectedBowl);
      const extractedItem = `${soupName}${ingredientTarget}`;
      setHandSlots((prev) =>
        prev.map((item, index) =>
          index === emptyIndex
            ? { kind: "ingredient", name: extractedItem }
            : item,
        ),
      );
      setTableSlots((prev) =>
        prev.map((bowl, index) =>
          index === selectedTableSlot && bowl
            ? {
                ...bowl,
                ingredients: removeLastMatching(
                  bowl.ingredients,
                  ingredientTarget,
                ),
                extracted: true,
              }
            : bowl,
        ),
      );
      pushLog(`${extractedItem}을/를 손에 넣었다.`);
      return;
    }

    if (actionId === "place") {
      const item = handSlots[selectedSlot];
      if (!item) {
        pushLog("선택한 슬롯이 비어 있어.");
        return;
      }

      if (item.kind === "bowl") {
        if (selectedBowl) {
          pushLog("이미 그릇이 있어. 다른 슬롯을 선택해.");
          return;
        }
        setTableSlots((prev) =>
          prev.map((bowl, index) =>
            index === selectedTableSlot ? item.bowl : bowl,
          ),
        );
        setHandSlots((prev) =>
          prev.map((slotItem, index) =>
            index === selectedSlot ? null : slotItem,
          ),
        );
        pushLog("그릇을 테이블에 놓았다.");
        return;
      }

      if (!selectedBowl) {
        pushLog("그릇이 먼저 필요해.");
        return;
      }
      if (selectedBowl.extracted) {
        pushLog("이 그릇은 국 이었던것이야. 폐기만 가능해.");
        return;
      }

      if (item.kind === "soup") {
        if (selectedBowl.hasSoup) {
          pushLog("이미 국이 들어 있어.");
          return;
        }
        setTableSlots((prev) =>
          prev.map((bowl, index) =>
            index === selectedTableSlot && bowl
              ? { ...bowl, hasSoup: true }
              : bowl,
          ),
        );
        setHandSlots((prev) =>
          prev.map((slotItem, index) =>
            index === selectedSlot ? null : slotItem,
          ),
        );
        pushLog("국을 넣었다.");
        return;
      }

      const type = getIngredientType(item.name);
      if (!selectedBowl.hasSoup) {
        pushLog("국이 먼저 필요해.");
        return;
      }
      if (type !== "떡" && type !== "만두") {
        pushLog("떡이나 만두만 넣을 수 있어.");
        return;
      }
      const already = selectedBowl.ingredients.some(
        (ingredient) => getIngredientType(ingredient) === type,
      );
      if (already) {
        pushLog(`${type}는 이미 들어 있어.`);
        return;
      }
      setTableSlots((prev) =>
        prev.map((bowl, index) =>
          index === selectedTableSlot && bowl
            ? { ...bowl, ingredients: [...bowl.ingredients, item.name] }
            : bowl,
        ),
      );
      setHandSlots((prev) =>
        prev.map((slotItem, index) =>
          index === selectedSlot ? null : slotItem,
        ),
      );
      pushLog(`${item.name}을/를 그릇에 넣었다.`);
      return;
    }

    if (actionId === "submit") {
      const bowlName =
        selectedBowl && isSoup(selectedBowl) ? getSoupName(selectedBowl) : null;
      const handItem = handSlots[selectedSlot];
      const handName = handItem ? getHandLabel(handItem) : null;
      const usableHandName = handItem
        ? handItem.kind === "ingredient"
          ? handItem.name
          : handItem.kind === "bowl" && isSoup(handItem.bowl)
            ? getSoupName(handItem.bowl)
            : null
        : null;

      let submittedName: string | null = null;
      let removeHand = false;

      if (bowlName === recipe) {
        submittedName = bowlName;
      } else if (usableHandName === recipe) {
        submittedName = usableHandName;
        removeHand = true;
      } else if (bowlName) {
        submittedName = bowlName;
      } else if (usableHandName) {
        submittedName = usableHandName;
        removeHand = true;
      } else if (handName) {
        submittedName = handName;
        removeHand = true;
      }

      if (!submittedName) {
        pushLog("제출할 대상이 없어.");
        return;
      }

      if (removeHand) {
        setHandSlots((prev) =>
          prev.map((item, index) => (index === selectedSlot ? null : item)),
        );
      }

      if (submittedName === recipe) {
        pushLog(`정답! ${submittedName} 제출 성공.`);
      } else {
        pushLog(`오답. ${submittedName} 제출.`);
      }
      setRecipe(nextRecipe);
      return;
    }
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", " "].includes(
          event.key,
        )
      ) {
        event.preventDefault();
      }

      if (event.key === "ArrowLeft") {
        setSelectedTableSlot((prev) => Math.max(prev - 1, 0));
      }
      if (event.key === "ArrowRight") {
        setSelectedTableSlot((prev) => Math.min(prev + 1, MAX_BOWLS - 1));
      }
      if (event.key === "ArrowUp") {
        setSelectedAction((prev) =>
          prev === 0 ? actions.length - 1 : prev - 1,
        );
      }
      if (event.key === "ArrowDown") {
        setSelectedAction((prev) => (prev + 1) % actions.length);
      }
      if (event.key >= "1" && event.key <= "5") {
        setSelectedSlot(Number(event.key) - 1);
      }
      if (event.key === " ") {
        const action = actions[selectedAction];
        if (action) {
          runAction(action.id);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [runAction, selectedAction]);

  return (
    <div className={styles.page}>
      <div className={styles.frame}>
        <header className={styles.header}>
          <div>
            <p className={styles.kicker}>Smoothie Recipe Trial</p>
            <h1 className={styles.title}>국 제시 게임</h1>
          </div>
          <div className={styles.recipeCard}>
            <span className={styles.recipeLabel}>현재 레시피</span>
            <strong className={styles.recipeText}>{recipe}</strong>
            <span className={styles.recipeHint}>제시하기로 제출</span>
          </div>
        </header>

        <main className={styles.board}>
          <section className={styles.tableSection}>
            <div className={styles.sectionHeader}>
              <h2>테이블</h2>
              <span>
                {tableSlots.filter((slot) => slot !== null).length}/{MAX_BOWLS}
              </span>
            </div>
            <div className={styles.table}>
              {tableSlots.map((bowl, index) => {
                const isSelected = index === selectedTableSlot;
                const name = bowl
                  ? bowl.extracted
                    ? "국 이었던것"
                    : getSoupName(bowl)
                  : "빈 슬롯";
                return (
                  <button
                    key={`slot-${index}`}
                    type="button"
                    className={`${styles.cup} ${isSelected ? styles.selected : ""}`}
                  >
                    <div className={styles.cupHeader}>
                      <span>테이블 {index + 1}</span>
                      {bowl && isSoup(bowl) && (
                        <span
                          className={`${styles.tag} ${
                            bowl.extracted ? styles.tagWarn : styles.tagGood
                          }`}
                        >
                          {bowl.extracted ? "추출됨" : "국"}
                        </span>
                      )}
                    </div>
                    <div className={styles.cupBody}>
                      <p>{bowl ? (bowl.hasSoup ? name : "빈 그릇") : name}</p>
                      <div className={styles.ingredientList}>
                        {bowl && bowl.ingredients.length > 0 ? (
                          bowl.ingredients.map((item, idx) => (
                            <span
                              key={`${bowl.id}-${idx}`}
                              className={styles.ingredient}
                            >
                              {item}
                            </span>
                          ))
                        ) : (
                          <span className={styles.muted}>
                            {bowl ? "재료 없음" : "비어 있음"}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
            <div className={styles.hand}>
              <div className={styles.sectionHeader}>
                <h2>손 재료</h2>
                <span>
                  {handCount}/{MAX_HAND}
                </span>
              </div>
              <div className={styles.handSlots}>
                {handSlots.map((item, index) => (
                  <button
                    key={`slot-${index}`}
                    type="button"
                    className={`${styles.handSlot} ${
                      index === selectedSlot ? styles.selectedSlot : ""
                    } ${item ? styles.filledSlot : ""}`}
                  >
                    <span className={styles.slotIndex}>{index + 1}</span>
                    <span>{item ? getHandLabel(item) : "비어있음"}</span>
                  </button>
                ))}
              </div>
            </div>
          </section>

          <section className={styles.actionSection}>
            <div className={styles.sectionHeader}>
              <h2>액션</h2>
              <span>↑↓ 선택 · Space 실행</span>
            </div>
            <ul className={styles.actions}>
              {actions.map((action, index) => (
                <li
                  key={action.id}
                  className={`${styles.actionItem} ${
                    index === selectedAction ? styles.selectedAction : ""
                  }`}
                >
                  <button type="button" onClick={() => runAction(action.id)}>
                    <span>{action.label}</span>
                    <small>{action.hint}</small>
                  </button>
                </li>
              ))}
            </ul>
            <div className={styles.log}>
              <div className={styles.sectionHeader}>
                <h2>기록</h2>
              </div>
              <ul>
                {log.map((entry, index) => (
                  <li key={`${entry}-${index}`}>{entry}</li>
                ))}
              </ul>
            </div>
            <div className={styles.hints}>
              <p>←→ 테이블 슬롯 선택 · ↑↓ 액션 선택 · Space 실행</p>
              <p>숫자 1~5: 기본은 손 슬롯, 놓기 선택 시 테이블 슬롯</p>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
