import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClipboardList, Pencil, BarChart3 } from "lucide-react";
import { GetAllPosts } from "@/services/postServices";
import {
  GetTopicsByPost,
  GetEvaluationResults,
} from "@/services/evaluationService";
import type { Post } from "@/interfaces/post";
import type { TopicItem, EvaluationResultItem } from "@/interfaces/evaluation";
import TopicsTab from "./TopicsTab";
import ResultsTab from "./ResultsTab";

export default function AdminFeedbackPage() {
  // Common state
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedActivity, setSelectedActivity] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("results");

  // Topics Tab state
  const [formDescription, setFormDescription] = useState("");
  const [items, setItems] = useState<TopicItem[]>([]);
  const [hasExistingData, setHasExistingData] = useState(false);
  const [originalItems, setOriginalItems] = useState<Record<number, string>>({});

  // Results Tab state
  const [results, setResults] = useState<EvaluationResultItem[]>([]);
  const [loadingResults, setLoadingResults] = useState(false);

  const fetchPosts = async () => {
    const res = await GetAllPosts();
    if (res?.status === 200) setPosts(res.data?.data || []);
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  // Load topics for a post
  const loadTopics = async (postId: string) => {
    setLoading(true);
    const res = await GetTopicsByPost(Number(postId));
    if (res?.status === 200) {
      const topics = res.data?.data || [];
      const hasData = topics.length > 0;
      setHasExistingData(hasData);
      setFormDescription(hasData ? topics[0].description || "" : "");
      setItems(
        topics.map((t: { ID: number; name: string }) => ({
          id: t.ID,
          name: t.name,
          isNew: false,
        }))
      );
      const originals: Record<number, string> = {};
      topics.forEach((t: { ID: number; name: string }) => {
        originals[t.ID] = t.name;
      });
      setOriginalItems(originals);
    } else {
      setFormDescription("");
      setItems([]);
      setHasExistingData(false);
    }
    setLoading(false);
  };

  // Load results for a post
  const loadResults = async (postId: string) => {
    setLoadingResults(true);
    const res = await GetEvaluationResults(Number(postId));
    if (res?.status === 200) {
      setResults(res.data?.data || []);
    } else {
      setResults([]);
    }
    setLoadingResults(false);
  };

  // Handle activity selection
  const handleSelectActivity = (postId: string) => {
    setSelectedActivity(postId);
    loadTopics(postId);
    loadResults(postId);
  };

  const selectedPost = posts.find((p) => String(p.ID) === selectedActivity);

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 bg-white shadow-sm flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-black">ระบบประเมินกิจกรรม</h1>
            <Select value={selectedActivity} onValueChange={handleSelectActivity}>
              <SelectTrigger className="w-64 bg-primary text-white border-0 rounded-full hover:bg-primary/90">
                <SelectValue placeholder="เลือกกิจกรรม" />
              </SelectTrigger>
              <SelectContent>
                {posts.map((p) => (
                  <SelectItem key={p.ID} value={String(p.ID)}>
                    {p.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Content */}
        {!selectedActivity ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <div className="p-4 bg-black rounded-full mb-4">
              <ClipboardList className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-600 mb-2">
              ยังไม่ได้เลือกกิจกรรม
            </h3>
            <p className="text-gray-400">กรุณาเลือกกิจกรรมจากเมนูด้านบน</p>
          </div>
        ) : (
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="flex-1 flex flex-col overflow-hidden"
          >
            <div className="px-6 pt-4 border-b border-gray-100">
              <TabsList className="grid w-full max-w-md grid-cols-2">
                <TabsTrigger value="results" className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  ผลการประเมิน
                </TabsTrigger>
                <TabsTrigger value="topics" className="flex items-center gap-2">
                  <Pencil className="w-4 h-4" />
                  หัวข้อประเมิน
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Results Tab */}
            <TabsContent value="results" className="flex-1 overflow-auto m-0">
              <ResultsTab
                selectedPost={selectedPost}
                results={results}
                loading={loadingResults}
              />
            </TabsContent>

            {/* Topics Tab */}
            <TabsContent value="topics" className="flex-1 overflow-auto m-0">
              <TopicsTab
                selectedActivity={selectedActivity}
                loading={loading}
                formDescription={formDescription}
                setFormDescription={setFormDescription}
                items={items}
                setItems={setItems}
                hasExistingData={hasExistingData}
                originalItems={originalItems}
                onRefresh={() => loadTopics(selectedActivity)}
              />
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}
