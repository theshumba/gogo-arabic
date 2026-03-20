EXTERNAL changeRelationship(npcId, amount)
EXTERNAL setLearningPath(path)
EXTERNAL startQuest(questId)
EXTERNAL getFlag(key)
EXTERNAL getLearningPath()
EXTERNAL getGossipToken(npcId)
EXTERNAL markGossipHeard(npcId)
EXTERNAL getGossipGrammarNote(npcId)

VAR quest_act_1_complete = false
VAR gossip_line = ""
VAR gossip_grammar = ""

~ gossip_line = getGossipToken("scholar-yusuf")
{gossip_line != "":
  -> gossip_knot
}
-> main

=== gossip_knot ===
{gossip_line}
~ gossip_grammar = getGossipGrammarNote("scholar-yusuf")
{gossip_grammar != "":
  [{gossip_grammar}]
}
~ markGossipHeard("scholar-yusuf")
-> main

=== main ===
{quest_act_1_complete:
  -> advanced_topics
- else:
  -> introduction
}

=== introduction ===
بسم الله الرحمن الرحيم. أنا يوسف، عالم المخطوطات.
~ changeRelationship("scholar-yusuf", 3)
هل تعلم أن بيت الحكمة في بغداد كان أعظم مكتبة في العالم؟
* [أخبرني المزيد عن بيت الحكمة]
  أسسه الخليفة هارون الرشيد في القرن الثامن الميلادي.
  ترجموا فيه كتب الإغريق والفرس والهنود إلى العربية.
  -> knowledge_hub
* [ما هذه المخطوطات؟]
  هذه مخطوطات من العصر الذهبي الإسلامي.
  فيها علوم الرياضيات والفلك والطب.
  -> knowledge_hub

=== advanced_topics ===
أهلاً بالعالم الشاب! أرى أنك تقدمت في رحلتك.
-> knowledge_hub

=== knowledge_hub ===
* [علمني كلمة جديدة]
  كلمة اليوم: مخطوط — manuscript.
  من جذر خ-ط-ط الذي يعني الكتابة.
  -> END
* [عن الخوارزمي]
  الخوارزمي أبو الجبر — كلمة algorithm مشتقة من اسمه!
  -> END
* [وداعاً]
  في أمان الله. العلم نور.
  -> END
