import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import api from "@/lib/api";
import { FaPlus, FaMinus } from 'react-icons/fa';
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const QUESTION_TYPES = [
  { value: "short", label: "Short Answer", backendType: "Short" },
  { value: "long", label: "Long Answer", backendType: "Long" },
  { value: "truefalse", label: "True/False", backendType: "TF" },
  { value: "mcq", label: "Multiple Choice", backendType: "MCQ" },
  { value: "fill", label: "Fill in the Blanks", backendType: "Fill" },
  { value: "matching", label: "Matching", backendType: "Match" },
  { value: "ordering", label: "Ordering", backendType: "Ordering" },
  { value: "media", label: "Image/Video", backendType: "Media" },
];

type Department = { _id: string; name: string };

type Question = {
  type: string;
  text: string;
  options: string[];
  answer: string;
  correctAnswers: string[];
  matchingPairs: { itemA: string; itemB: string }[];
  correctSequence: string[];
  marks: number;
  mediaUrl?: string;
  videoUrl?: string;
  mediaQuestionType?: string;
  _id?: string;
};

type Quiz = {
  _id?: string;
  title: string;
  description: string;
  timeLimit: number;
  schedule: string;
  department: string;
  questions: Question[];
};

type QuizFormProps = {
  mode: "create" | "edit";
  initialQuiz?: Quiz;
  onSave?: () => void;
};

// Question Type Components
const ShortAnswerEditor = ({ question, onChange }: { question: Question; onChange: (q: Question) => void }) => (
  <div className="space-y-4">
    <div>
      <Label>Question Text</Label>
      <Textarea
        value={question.text}
        onChange={(e) => onChange({ ...question, text: e.target.value })}
        placeholder="Enter your question..."
        rows={3}
      />
    </div>
    <div>
      <Label>Correct Answer</Label>
      <Input
        value={question.answer}
        onChange={(e) => onChange({ ...question, answer: e.target.value })}
        placeholder="Enter the correct answer"
      />
    </div>
  </div>
);

const LongAnswerEditor = ({ question, onChange }: { question: Question; onChange: (q: Question) => void }) => (
  <div className="space-y-4">
    <div>
      <Label>Question Text</Label>
      <Textarea
        value={question.text}
        onChange={(e) => onChange({ ...question, text: e.target.value })}
        placeholder="Enter your descriptive question..."
        rows={4}
      />
    </div>
    <div>
      <Label>Sample Answer (Optional - for manual checking)</Label>
      <Textarea
        value={question.answer}
        onChange={(e) => onChange({ ...question, answer: e.target.value })}
        placeholder="Enter a sample answer for reference..."
        rows={3}
      />
    </div>
  </div>
);

const TrueFalseEditor = ({ question, onChange }: { question: Question; onChange: (q: Question) => void }) => (
  <div className="space-y-4">
    <div>
      <Label>Question Text</Label>
      <Textarea
        value={question.text}
        onChange={(e) => onChange({ ...question, text: e.target.value })}
        placeholder="Enter your True/False question..."
        rows={3}
      />
    </div>
    <div>
      <Label>Correct Answer</Label>
      <RadioGroup
        value={question.answer}
        onValueChange={(value) => onChange({ ...question, answer: value })}
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="true" id="true" />
          <Label htmlFor="true">True</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="false" id="false" />
          <Label htmlFor="false">False</Label>
        </div>
      </RadioGroup>
    </div>
  </div>
);

const MCQEditor = ({ question, onChange }: { question: Question; onChange: (q: Question) => void }) => {
  const addOption = () => {
    onChange({ ...question, options: [...question.options, ""] });
  };

  const removeOption = (index: number) => {
    const newOptions = question.options.filter((_, i) => i !== index);
    onChange({ ...question, options: newOptions });
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...question.options];
    newOptions[index] = value;
    onChange({ ...question, options: newOptions });
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>Question Text</Label>
        <Textarea
          value={question.text}
          onChange={(e) => onChange({ ...question, text: e.target.value })}
          placeholder="Enter your multiple choice question..."
          rows={3}
        />
      </div>
      <div>
        <Label>Options</Label>
        {question.options.map((option, index) => (
          <div key={index} className="flex items-center gap-2 mb-2">
            <span className="font-medium">{String.fromCharCode(65 + index)}.</span>
            <Input
              value={option}
              onChange={(e) => updateOption(index, e.target.value)}
              placeholder={`Option ${String.fromCharCode(65 + index)}`}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => removeOption(index)}
              disabled={question.options.length <= 2}
            >
              <FaMinus />
            </Button>
          </div>
        ))}
        <Button type="button" variant="outline" onClick={addOption} className="mt-2">
          <FaPlus className="mr-2" /> Add Option
        </Button>
      </div>
      <div>
        <Label>Correct Answer</Label>
        <Select value={question.answer} onValueChange={(value) => onChange({ ...question, answer: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Select correct option" />
          </SelectTrigger>
          <SelectContent>
            {question.options.map((option, index) => (
              <SelectItem key={index} value={String.fromCharCode(65 + index)}>
                {String.fromCharCode(65 + index)}. {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

const FillBlanksEditor = ({ question, onChange }: { question: Question; onChange: (q: Question) => void }) => {
  const addBlank = () => {
    onChange({ ...question, correctAnswers: [...question.correctAnswers, ""] });
  };

  const removeBlank = (index: number) => {
    const newAnswers = question.correctAnswers.filter((_, i) => i !== index);
    onChange({ ...question, correctAnswers: newAnswers });
  };

  const updateBlank = (index: number, value: string) => {
    const newAnswers = [...question.correctAnswers];
    newAnswers[index] = value;
    onChange({ ...question, correctAnswers: newAnswers });
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>Question Text (Use ___ for blanks)</Label>
        <Textarea
          value={question.text}
          onChange={(e) => onChange({ ...question, text: e.target.value })}
          placeholder="Enter your question with ___ for blanks. Example: The capital of France is ___."
          rows={3}
        />
      </div>
      <div>
        <Label>Correct Answers for Blanks</Label>
        {question.correctAnswers.map((answer, index) => (
          <div key={index} className="flex items-center gap-2 mb-2">
            <span className="font-medium">Blank {index + 1}:</span>
            <Input
              value={answer}
              onChange={(e) => updateBlank(index, e.target.value)}
              placeholder={`Answer for blank ${index + 1}`}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => removeBlank(index)}
              disabled={question.correctAnswers.length <= 1}
            >
              <FaMinus />
            </Button>
          </div>
        ))}
        <Button type="button" variant="outline" onClick={addBlank} className="mt-2">
          <FaPlus className="mr-2" /> Add Blank
        </Button>
      </div>
    </div>
  );
};

const MatchingEditor = ({ question, onChange }: { question: Question; onChange: (q: Question) => void }) => {
  const addPair = () => {
    onChange({
      ...question,
      matchingPairs: [...question.matchingPairs, { itemA: "", itemB: "" }]
    });
  };

  const removePair = (index: number) => {
    const newPairs = question.matchingPairs.filter((_, i) => i !== index);
    onChange({ ...question, matchingPairs: newPairs });
  };

  const updatePair = (index: number, field: 'itemA' | 'itemB', value: string) => {
    const newPairs = [...question.matchingPairs];
    newPairs[index] = { ...newPairs[index], [field]: value };
    onChange({ ...question, matchingPairs: newPairs });
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>Question Text</Label>
        <Textarea
          value={question.text}
          onChange={(e) => onChange({ ...question, text: e.target.value })}
          placeholder="Enter instructions for the matching question..."
          rows={3}
        />
      </div>
      <div>
        <Label>Matching Pairs</Label>
        <div className="grid grid-cols-2 gap-4 mb-2">
          <div className="font-medium">Column A</div>
          <div className="font-medium">Column B</div>
        </div>
        {question.matchingPairs.map((pair, index) => (
          <div key={index} className="grid grid-cols-2 gap-4 mb-2">
            <Input
              value={pair.itemA}
              onChange={(e) => updatePair(index, 'itemA', e.target.value)}
              placeholder={`Item A ${index + 1}`}
            />
            <div className="flex gap-2">
              <Input
                value={pair.itemB}
                onChange={(e) => updatePair(index, 'itemB', e.target.value)}
                placeholder={`Item B ${index + 1}`}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => removePair(index)}
                disabled={question.matchingPairs.length <= 1}
              >
                <FaMinus />
              </Button>
            </div>
          </div>
        ))}
        <Button type="button" variant="outline" onClick={addPair} className="mt-2">
          <FaPlus className="mr-2" /> Add Pair
        </Button>
      </div>
    </div>
  );
};

const OrderingEditor = ({ question, onChange }: { question: Question; onChange: (q: Question) => void }) => {
  const addItem = () => {
    onChange({ ...question, correctSequence: [...question.correctSequence, ""] });
  };

  const removeItem = (index: number) => {
    const newSequence = question.correctSequence.filter((_, i) => i !== index);
    onChange({ ...question, correctSequence: newSequence });
  };

  const updateItem = (index: number, value: string) => {
    const newSequence = [...question.correctSequence];
    newSequence[index] = value;
    onChange({ ...question, correctSequence: newSequence });
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>Question Text</Label>
        <Textarea
          value={question.text}
          onChange={(e) => onChange({ ...question, text: e.target.value })}
          placeholder="Enter instructions for the ordering question..."
          rows={3}
        />
      </div>
      <div>
        <Label>Items in Correct Order</Label>
        {question.correctSequence.map((item, index) => (
          <div key={index} className="flex items-center gap-2 mb-2">
            <span className="font-medium">{index + 1}.</span>
            <Input
              value={item}
              onChange={(e) => updateItem(index, e.target.value)}
              placeholder={`Item ${index + 1}`}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => removeItem(index)}
              disabled={question.correctSequence.length <= 2}
            >
              <FaMinus />
            </Button>
          </div>
        ))}
        <Button type="button" variant="outline" onClick={addItem} className="mt-2">
          <FaPlus className="mr-2" /> Add Item
        </Button>
      </div>
    </div>
  );
};

const MediaEditor = ({ question, onChange }: { question: Question; onChange: (q: Question) => void }) => {
  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video') => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const formData = new FormData();
    formData.append("file", file);
    
    try {
      const res = await api.post("/upload", formData, { 
        headers: { "Content-Type": "multipart/form-data" } 
      });
      
      if (res.data.url) {
        if (type === 'image') {
          onChange({ ...question, mediaUrl: res.data.url });
        } else {
          onChange({ ...question, videoUrl: res.data.url });
        }
      }
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>Question Text</Label>
        <Textarea
          value={question.text}
          onChange={(e) => onChange({ ...question, text: e.target.value })}
          placeholder="Enter your question about the media..."
          rows={3}
        />
      </div>
      <div>
        <Label>Media Upload</Label>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <label>
              <FaImage className="mr-2" />
              Upload Image
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => handleMediaUpload(e, 'image')}
              />
            </label>
          </Button>
          <Button variant="outline" asChild>
            <label>
              <FaVideo className="mr-2" />
              Upload Video
              <input
                type="file"
                accept="video/*"
                hidden
                onChange={(e) => handleMediaUpload(e, 'video')}
              />
            </label>
          </Button>
        </div>
        {question.mediaUrl && (
          <div className="mt-2">
            <img src={question.mediaUrl} alt="Uploaded" className="max-w-xs h-auto" />
          </div>
        )}
        {question.videoUrl && (
          <div className="mt-2">
            <video src={question.videoUrl} controls className="max-w-xs" />
          </div>
        )}
      </div>
      <div>
        <Label>Question Type for Media</Label>
        <Select
          value={question.mediaQuestionType || "mcq"}
          onValueChange={(value) => onChange({ ...question, mediaQuestionType: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="mcq">Multiple Choice</SelectItem>
            <SelectItem value="tf">True/False</SelectItem>
            <SelectItem value="short">Short Answer</SelectItem>
            <SelectItem value="long">Long Answer</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {/* Render the appropriate editor based on mediaQuestionType */}
      {question.mediaQuestionType === "mcq" && (
        <MCQEditor question={question} onChange={onChange} />
      )}
      {question.mediaQuestionType === "tf" && (
        <TrueFalseEditor question={question} onChange={onChange} />
      )}
      {question.mediaQuestionType === "short" && (
        <ShortAnswerEditor question={question} onChange={onChange} />
      )}
      {question.mediaQuestionType === "long" && (
        <LongAnswerEditor question={question} onChange={onChange} />
      )}
    </div>
  );
};

// Main QuizForm Component
export default function QuizForm({ mode, initialQuiz, onSave }: QuizFormProps) {
  const [quiz, setQuiz] = useState<Quiz>(initialQuiz || {
    title: "",
    description: "",
    timeLimit: 30,
    schedule: "",
    department: "",
    questions: [],
  });
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [questionDraft, setQuestionDraft] = useState<Question>({
    type: "short",
    text: "",
    options: ["", "", "", ""],
    answer: "",
    correctAnswers: [""],
    matchingPairs: [{ itemA: "", itemB: "" }],
    correctSequence: ["", ""],
    marks: 1,
    mediaQuestionType: "mcq"
  });
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loadingDepartments, setLoadingDepartments] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    setQuiz(
      initialQuiz
        ? { ...initialQuiz, questions: Array.isArray(initialQuiz.questions) ? initialQuiz.questions : [] }
        : {
            title: "",
            description: "",
            timeLimit: 30,
            schedule: "",
            department: "",
            questions: [],
          }
    );
  }, [initialQuiz]);

  useEffect(() => {
    const fetchDepartments = async () => {
      setLoadingDepartments(true);
      try {
        const res = await api.get("/departments");
        setDepartments(res.data.data || []);
      } catch (e) {
        setDepartments([]);
      }
      setLoadingDepartments(false);
    };
    fetchDepartments();
  }, []);

  // Reset question draft when type changes
  useEffect(() => {
    setQuestionDraft(prev => ({
      ...prev,
      type: questionDraft.type,
      options: questionDraft.type === "mcq" ? ["", "", "", ""] : prev.options,
      correctAnswers: questionDraft.type === "fill" ? [""] : prev.correctAnswers,
      matchingPairs: questionDraft.type === "matching" ? [{ itemA: "", itemB: "" }] : prev.matchingPairs,
      correctSequence: questionDraft.type === "ordering" ? ["", ""] : prev.correctSequence,
    }));
  }, [questionDraft.type]);

  // Add or update question
  const handleAddOrUpdateQuestion = () => {
    // Validate question based on type
    let isValid = true;
    let errorMessage = "";

    if (!questionDraft.text.trim()) {
      isValid = false;
      errorMessage = "Question text is required";
    }

    switch (questionDraft.type) {
      case "mcq":
        if (questionDraft.options.filter(opt => opt.trim()).length < 2) {
          isValid = false;
          errorMessage = "MCQ questions must have at least 2 options";
        }
        if (!questionDraft.answer) {
          isValid = false;
          errorMessage = "Please select the correct answer";
        }
        break;
      case "truefalse":
        if (!questionDraft.answer) {
          isValid = false;
          errorMessage = "Please select True or False";
        }
        break;
      case "fill":
        if (questionDraft.correctAnswers.filter(ans => ans.trim()).length === 0) {
          isValid = false;
          errorMessage = "Fill in the blanks must have at least one correct answer";
        }
        break;
      case "matching":
        if (questionDraft.matchingPairs.filter(pair => pair.itemA.trim() && pair.itemB.trim()).length === 0) {
          isValid = false;
          errorMessage = "Matching questions must have at least one pair";
        }
        break;
      case "ordering":
        if (questionDraft.correctSequence.filter(item => item.trim()).length < 2) {
          isValid = false;
          errorMessage = "Ordering questions must have at least 2 items";
        }
        break;
    }

    if (!isValid) {
      toast({
        title: "Validation Error",
        description: errorMessage,
        variant: "destructive"
      });
      return;
    }

    if (editingIndex !== null) {
      setQuiz((q) => {
        const updated = [...q.questions];
        updated[editingIndex] = questionDraft;
        return { ...q, questions: updated };
      });
      setEditingIndex(null);
    } else {
      setQuiz((q) => ({ ...q, questions: [...q.questions, questionDraft] }));
    }
    
    // Reset question draft
    setQuestionDraft({
      type: "short",
      text: "",
      options: ["", "", "", ""],
      answer: "",
      correctAnswers: [""],
      matchingPairs: [{ itemA: "", itemB: "" }],
      correctSequence: ["", ""],
      marks: 1,
      mediaQuestionType: "mcq"
    });
  };

  // Edit question
  const handleEditQuestion = (idx: number) => {
    setEditingIndex(idx);
    setQuestionDraft(quiz.questions[idx]);
  };

  // Remove question
  const handleRemoveQuestion = (idx: number) => {
    setQuiz((q) => ({ ...q, questions: q.questions.filter((_, i) => i !== idx) }));
    setEditingIndex(null);
  };

  // Save quiz (API integration)
  const handleSaveQuiz = async () => {
    setSaving(true);
    setError("");
    
    if (!quiz.title.trim()) {
      toast({ title: 'Validation Error', description: 'Quiz title is required.', variant: 'destructive' });
      setSaving(false);
      return;
    }
    if (!quiz.department) {
      toast({ title: 'Validation Error', description: 'Department is required.', variant: 'destructive' });
      setSaving(false);
      return;
    }
    if (!quiz.questions.length) {
      toast({ title: 'Validation Error', description: 'At least one question is required.', variant: 'destructive' });
      setSaving(false);
      return;
    }

    try {
      let quizId = quiz._id;
      if (mode === "create") {
        const quizRes = await api.post("/live-quizzes", {
          title: quiz.title,
          description: quiz.description,
          timeLimit: quiz.timeLimit,
          schedule: quiz.schedule,
          totalQuestions: quiz.questions.length,
          department: quiz.department,
          status: 'draft', // Create quiz in draft status
        });
        const quizData = quizRes.data;
        if (!quizData.data?._id) throw new Error(quizData.message || "Failed to create quiz");
        quizId = quizData.data._id;
      } else if (mode === "edit" && quiz._id) {
        await api.put(`/live-quizzes/${quiz._id}`, {
          title: quiz.title,
          description: quiz.description,
          timeLimit: quiz.timeLimit,
          schedule: quiz.schedule,
          totalQuestions: quiz.questions.length,
          department: quiz.department,
        });
        quizId = quiz._id;
      }

      // Save questions
      for (const [order, q] of quiz.questions.entries()) {
        const questionType = QUESTION_TYPES.find(t => t.value === q.type)?.backendType || "Short";
        
        const payload: any = {
          type: questionType,
          questionText: q.text,
          order: order + 1,
          marks: q.marks || 1
        };

        // Add type-specific data
        switch (q.type) {
          case "mcq":
            payload.options = q.options.filter(opt => opt.trim());
            payload.correctAnswer = q.answer;
            break;
          case "truefalse":
            payload.correctAnswer = q.answer;
            break;
          case "fill":
            payload.correctAnswers = q.correctAnswers.filter(ans => ans.trim());
            break;
          case "matching":
            payload.matchingPairs = q.matchingPairs.filter(pair => pair.itemA.trim() && pair.itemB.trim());
            break;
          case "ordering":
            payload.correctSequence = q.correctSequence.filter(item => item.trim());
            break;
          case "media":
            payload.mediaQuestionType = q.mediaQuestionType;
            if (q.mediaUrl) payload.imageUrl = q.mediaUrl;
            if (q.videoUrl) payload.videoUrl = q.videoUrl;
            // Add the underlying question data
            if (q.mediaQuestionType === "mcq") {
              payload.options = q.options.filter(opt => opt.trim());
              payload.correctAnswer = q.answer;
            } else if (q.mediaQuestionType === "tf") {
              payload.correctAnswer = q.answer;
            } else {
              payload.correctAnswer = q.answer;
            }
            break;
          default:
            payload.correctAnswer = q.answer;
        }

        if (mode === "create") {
          await api.post(`/live-quiz-questions/${quizId}`, payload);
        } else if (mode === "edit" && q._id) {
          await api.put(`/live-quiz-questions/${q._id}`, payload);
        } else if (mode === "edit") {
          await api.post(`/live-quiz-questions/${quizId}`, payload);
        }
      }
      
      setSaving(false);
      toast({ 
        title: mode === "create" ? 'Quiz Saved' : 'Quiz Updated', 
        description: `Quiz successfully ${mode === "create" ? 'saved' : 'updated'}!`, 
        variant: 'default' 
      });
      if (onSave) onSave();
    } catch (e: any) {
      setSaving(false);
      setError(e.message || `Failed to ${mode === "create" ? 'save' : 'update'} quiz`);
      toast({ 
        title: mode === "create" ? 'Save Error' : 'Update Error', 
        description: e.message || `Failed to ${mode === "create" ? 'save' : 'update'} quiz.`, 
        variant: 'destructive' 
      });
    }
  };

  // Start live quiz
  const handleStartLive = async () => {
    setSaving(true);
    setError("");
    try {
      let quizId = quiz._id;
      // If creating, save first
      if (mode === "create") {
        const quizRes = await api.post("/live-quizzes", {
          title: quiz.title,
          description: quiz.description,
          timeLimit: quiz.timeLimit,
          schedule: quiz.schedule,
          totalQuestions: quiz.questions.length,
          department: quiz.department,
          status: 'draft', // Create quiz in draft status
        });
        const quizData = quizRes.data;
        if (!quizData.data?._id) throw new Error(quizData.message || "Failed to create quiz");
        quizId = quizData.data._id;
        
        // Save questions
        for (const [order, q] of quiz.questions.entries()) {
          const questionType = QUESTION_TYPES.find(t => t.value === q.type)?.backendType || "Short";
          
          const payload: any = {
            type: questionType,
            questionText: q.text,
            order: order + 1,
            marks: q.marks || 1
          };

          // Add type-specific data
          switch (q.type) {
            case "mcq":
              payload.options = q.options.filter(opt => opt.trim());
              payload.correctAnswer = q.answer;
              break;
            case "truefalse":
              payload.correctAnswer = q.answer;
              break;
            case "fill":
              payload.correctAnswers = q.correctAnswers.filter(ans => ans.trim());
              break;
            case "matching":
              payload.matchingPairs = q.matchingPairs.filter(pair => pair.itemA.trim() && pair.itemB.trim());
              break;
            case "ordering":
              payload.correctSequence = q.correctSequence.filter(item => item.trim());
              break;
            case "media":
              payload.mediaQuestionType = q.mediaQuestionType;
              if (q.mediaUrl) payload.imageUrl = q.mediaUrl;
              if (q.videoUrl) payload.videoUrl = q.videoUrl;
              if (q.mediaQuestionType === "mcq") {
                payload.options = q.options.filter(opt => opt.trim());
                payload.correctAnswer = q.answer;
              } else if (q.mediaQuestionType === "tf") {
                payload.correctAnswer = q.answer;
              } else {
                payload.correctAnswer = q.answer;
              }
              break;
            default:
              payload.correctAnswer = q.answer;
          }

          await api.post(`/live-quiz-questions/${quizId}`, payload);
        }
      }
      // Start the quiz
      await api.post(`/live-quizzes/${quizId}/start`);
      setSaving(false);
      toast({ title: 'Quiz is now live!', description: 'The quiz has been started in live mode.' });
      if (onSave) onSave();
    } catch (e: any) {
      setSaving(false);
      setError(e.message || 'Failed to start live quiz');
      toast({ title: 'Start Live Error', description: e.message || 'Failed to start live quiz.', variant: 'destructive' });
    }
  };

  // Render question editor based on type
  const renderQuestionEditor = () => {
    switch (questionDraft.type) {
      case "short":
        return <ShortAnswerEditor question={questionDraft} onChange={setQuestionDraft} />;
      case "long":
        return <LongAnswerEditor question={questionDraft} onChange={setQuestionDraft} />;
      case "truefalse":
        return <TrueFalseEditor question={questionDraft} onChange={setQuestionDraft} />;
      case "mcq":
        return <MCQEditor question={questionDraft} onChange={setQuestionDraft} />;
      case "fill":
        return <FillBlanksEditor question={questionDraft} onChange={setQuestionDraft} />;
      case "matching":
        return <MatchingEditor question={questionDraft} onChange={setQuestionDraft} />;
      case "ordering":
        return <OrderingEditor question={questionDraft} onChange={setQuestionDraft} />;
      case "media":
        return <MediaEditor question={questionDraft} onChange={setQuestionDraft} />;
      default:
        return <ShortAnswerEditor question={questionDraft} onChange={setQuestionDraft} />;
    }
  };

  return (
    <div>
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Quiz Title</Label>
            <Input value={quiz.title} onChange={e => setQuiz(q => ({ ...q, title: e.target.value }))} required />
          </div>
          <div>
            <Label>Description</Label>
            <Input value={quiz.description} onChange={e => setQuiz(q => ({ ...q, description: e.target.value }))} />
          </div>
          <div>
            <Label>Time Limit (minutes)</Label>
            <Input type="number" min={1} value={quiz.timeLimit} onChange={e => setQuiz(q => ({ ...q, timeLimit: Number(e.target.value) }))} />
          </div>
          <div>
            <Label>Department</Label>
            <select
              value={quiz.department}
              onChange={e => setQuiz(q => ({ ...q, department: e.target.value }))}
              className="w-full border rounded px-2 py-1"
              required
            >
              <option value="" disabled>Select Department</option>
              {departments.map(dep => (
                <option key={dep._id} value={dep._id}>{dep.name}</option>
              ))}
            </select>
          </div>
          <div>
            <Label>Schedule (optional)</Label>
            <Input type="datetime-local" value={quiz.schedule} onChange={e => setQuiz(q => ({ ...q, schedule: e.target.value }))} />
          </div>
        </div>
      </div>

      {/* Questions Builder */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Questions</h2>
          <span className="text-gray-500">Total questions: {(quiz.questions || []).length}</span>
        </div>
        
        <DndProvider backend={HTML5Backend}>
          {(quiz.questions || []).map((q, idx) => (
            <div key={idx} className="flex items-center gap-2 mb-2">
              <span className="cursor-move">#{idx + 1}</span>
              <Card className="flex-1">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{QUESTION_TYPES.find(t => t.value === q.type)?.label}</span>
                    <span className="text-sm text-gray-500">{q.marks} mark{q.marks !== 1 ? 's' : ''}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mb-2">{q.text}</div>
                  {/* Render question-specific preview */}
                  {q.type === "mcq" && (
                    <div className="text-sm text-gray-600">
                      Options: {q.options.filter(opt => opt.trim()).map((opt, i) => `${String.fromCharCode(65 + i)}. ${opt}`).join(', ')}
                      <br />
                      Correct: {q.answer}
                    </div>
                  )}
                  {q.type === "truefalse" && (
                    <div className="text-sm text-gray-600">
                      Correct Answer: {q.answer}
                    </div>
                  )}
                  {q.type === "fill" && (
                    <div className="text-sm text-gray-600">
                      Blanks: {q.correctAnswers.filter(ans => ans.trim()).length}
                    </div>
                  )}
                  {q.type === "matching" && (
                    <div className="text-sm text-gray-600">
                      Pairs: {q.matchingPairs.filter(pair => pair.itemA.trim() && pair.itemB.trim()).length}
                    </div>
                  )}
                  {q.type === "ordering" && (
                    <div className="text-sm text-gray-600">
                      Items: {q.correctSequence.filter(item => item.trim()).length}
                    </div>
                  )}
                  {q.type === "media" && (
                    <div className="text-sm text-gray-600">
                      Media: {q.mediaUrl ? 'Image' : q.videoUrl ? 'Video' : 'None'}
                      {q.mediaQuestionType && ` (${q.mediaQuestionType.toUpperCase()})`}
                    </div>
                  )}
                </CardContent>
              </Card>
              <Button size="icon" variant="outline" onClick={() => handleEditQuestion(idx)} aria-label="Edit">
                <FaEdit />
              </Button>
              <Button size="icon" variant="destructive" onClick={() => handleRemoveQuestion(idx)} aria-label="Delete">
                <FaTrash />
              </Button>
            </div>
          ))}
        </DndProvider>

        {/* Question Editor */}
        <div className="border rounded p-4 bg-gray-50 mb-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <Label>Question Type</Label>
              <Select value={questionDraft.type} onValueChange={(value) => setQuestionDraft(q => ({ ...q, type: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {QUESTION_TYPES.map(t => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Marks</Label>
              <Input 
                type="number" 
                min={1} 
                value={questionDraft.marks} 
                onChange={e => setQuestionDraft(q => ({ ...q, marks: Number(e.target.value) }))} 
              />
            </div>
          </div>
          
          {renderQuestionEditor()}
          
          <Button 
            className="mt-4 bg-[#0E2647] hover:bg-[#FAB364] hover:text-[#0E2647]" 
            onClick={handleAddOrUpdateQuestion}
          >
            {editingIndex !== null ? "Update Question" : "Add Question"}
          </Button>
        </div>
      </div>

      <div className="flex gap-4 justify-end">
        <Button 
          className="bg-[#0E2647] hover:bg-[#FAB364] hover:text-[#0E2647]" 
          onClick={handleSaveQuiz} 
          disabled={saving}
        >
          {saving ? "Saving..." : mode === "edit" ? "Update Quiz" : "Save Quiz"}
        </Button>
        <Button 
          className="bg-green-700 hover:bg-green-800 text-white" 
          onClick={handleStartLive} 
          disabled={saving}
        >
          {saving ? "Starting..." : "Start Live Now"}
        </Button>
      </div>
      
      {error && <div className="text-red-500 mt-2">{error}</div>}
    </div>
  );
} 