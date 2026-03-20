EXTERNAL changeRelationship(npcId, amount)
EXTERNAL setLearningPath(path)
EXTERNAL startQuest(questId)
EXTERNAL getFlag(key)
EXTERNAL getLearningPath()
EXTERNAL getGossipToken(npcId)
EXTERNAL markGossipHeard(npcId)
EXTERNAL getGossipGrammarNote(npcId)

VAR onboarding_complete = false
VAR onboarding_first_word_learned = false
VAR onboarding_mentor_met = false
VAR gossip_line = ""
VAR gossip_grammar = ""

~ gossip_line = getGossipToken("guide-amira")
{gossip_line != "":
  -> gossip_knot
}
-> main

=== gossip_knot ===
{gossip_line}
~ gossip_grammar = getGossipGrammarNote("guide-amira")
{gossip_grammar != "":
  [{gossip_grammar}]
}
~ markGossipHeard("guide-amira")
-> main

=== main ===
{onboarding_complete:
  -> returning_player
- else:
  -> first_meeting
}

=== first_meeting ===
السلام عليكم يا صديقي! أنا أميرة، سأكون مرشدتك.
~ changeRelationship("guide-amira", 5)
أهلاً وسهلاً في عالم اللغة العربية!
* [ما هذا المكان؟]
  هذه واحة المعرفة — مكان آمن لتعلم العربية.
  -> main_hub
* [من أنتِ؟]
  أنا أميرة، عالمة ومرشدة. سأساعدك في رحلتك.
  -> main_hub

=== returning_player ===
عودة ميمونة! ماذا تريد أن نفعل اليوم؟
-> main_hub

=== main_hub ===
* [أريد أن أتعلم]
  تعال، لنبدأ الدرس!
  -> END
* [أخبريني عن هذا المكان]
  هذا المكان يحتوي على كنوز المعرفة العربية.
  -> END
* [وداعاً]
  مع السلامة! سأكون هنا عندما تحتاجني.
  -> END
