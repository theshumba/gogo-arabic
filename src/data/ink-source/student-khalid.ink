EXTERNAL changeRelationship(npcId, amount)
EXTERNAL setLearningPath(path)
EXTERNAL startQuest(questId)
EXTERNAL getFlag(key)
EXTERNAL getLearningPath()
EXTERNAL getGossipToken(npcId)
EXTERNAL markGossipHeard(npcId)
EXTERNAL getGossipGrammarNote(npcId)

VAR onboarding_complete = false
VAR gossip_line = ""
VAR gossip_grammar = ""

~ gossip_line = getGossipToken("student-khalid")
{gossip_line != "":
  -> gossip_knot
}
-> main

=== gossip_knot ===
{gossip_line}
~ gossip_grammar = getGossipGrammarNote("student-khalid")
{gossip_grammar != "":
  [{gossip_grammar}]
}
~ markGossipHeard("student-khalid")
-> main

=== main ===
{onboarding_complete:
  -> study_buddy
- else:
  -> fellow_student
}

=== fellow_student ===
مرحباً! أنا خالد، طالب مثلك.
~ changeRelationship("student-khalid", 3)
أنا أيضاً أتعلم العربية. نتعلم معاً!
* [كيف أتعلم بسرعة؟]
  التكرار مهم جداً. راجع كلماتك كل يوم.
  ونظام FSRS يساعدك — يعرض الكلمات الصعبة أكثر.
  -> study_hub
* [ما هي النصائح؟]
  اقرأ اللافتات في القرية — كل واحدة تعلمك كلمة.
  وتحدث مع كل شخص تقابله.
  -> study_hub

=== study_buddy ===
يا صديقي! كم كلمة تعلمت اليوم؟
-> study_hub

=== study_hub ===
* [لنتدرب معاً]
  هيا بنا! التدريب يجعلنا أفضل.
  -> END
* [ما معنى هذه الكلمة؟]
  أي كلمة؟ أنا أحب المفردات الجديدة!
  -> END
* [إلى اللقاء]
  مع السلامة يا صديقي! لا تنسَ المراجعة.
  -> END
