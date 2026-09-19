import React, { useState } from 'react';
import { SubBuvaki, Post, User } from '../types';
import { SectionSelectCard } from './creation/SectionSelectCard';
import { PostFormatCard, PostFormatType } from './creation/PostFormatCard';
import { UploadContentCard } from './creation/UploadContentCard';
import { ThumbnailCard } from './creation/ThumbnailCard';
import { PostDetailsCard } from './creation/PostDetailsCard';
import { captureVideoFrame, formatFileSize, processImageFile } from '../lib/mediaUtils';
import { uploadMediaFile } from '../lib/videoUploadService';
import { Info, Sparkles, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type ProceduralStep =
  | 'section_select'
  | 'post_format_select'
  | 'upload_content'
  | 'thumbnail_select'
  | 'post_details';

interface CreatePostModalProps {
  subBuvakis: SubBuvaki[];
  selectedSubId?: string | null;
  onClose: () => void;
  onSubmitPost: (newPostData: Partial<Post>) => void;
  currentUser?: User | null;
}

export const CreatePostModal: React.FC<CreatePostModalProps> = ({
  subBuvakis,
  selectedSubId,
  onClose,
  onSubmitPost,
  currentUser,
}) => {
  // Navigation step state
  const [currentStep, setCurrentStep] = useState<ProceduralStep>('section_select');
  const [comingSoonNotice, setComingSoonNotice] = useState<string | null>(null);

  // Post Format state
  const [postFormat, setPostFormat] = useState<PostFormatType>('text');

  // Video media state
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  const [videoFileName, setVideoFileName] = useState<string>('');
  const [videoFileSize, setVideoFileSize] = useState<string>('');
  const [videoUrlInput, setVideoUrlInput] = useState<string>('');
  const [uploadedVideoUrl, setUploadedVideoUrl] = useState<string | null>(null);
  const [uploadedMediaId, setUploadedMediaId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadStatusText, setUploadStatusText] = useState<string>('');

  // Thumbnails state
  const [autoThumbnail, setAutoThumbnail] = useState<string | null>(null);
  const [customThumbnail, setCustomThumbnail] = useState<string | null>(null);
  const [selectedThumbnail, setSelectedThumbnail] = useState<string | null>(null);

  // Photo state
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [imageUrlInput, setImageUrlInput] = useState<string>('');

  // Text, Link & Poll state
  const [textContent, setTextContent] = useState<string>('');
  const [linkUrl, setLinkUrl] = useState<string>('');
  const [pollQuestion, setPollQuestion] = useState<string>('');
  const [pollOptions, setPollOptions] = useState<string[]>(['', '']);

  // Details state
  const [subId, setSubId] = useState(selectedSubId || subBuvakis[0]?.id || 'general');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [flair, setFlair] = useState('Discussion');
  const [tags, setTags] = useState<string[]>(['#Buvaki']);
  const [isSaving, setIsSaving] = useState(false);

  // Handlers
  const handleSelectSection = (section: 'posts' | 'shorts' | 'longs') => {
    if (section === 'posts') {
      setCurrentStep('post_format_select');
    } else {
      setComingSoonNotice(
        `You selected ${section.toUpperCase()}. We are focusing on Posts first as instructed! You can continue with Posts now or wait for the Shorts/Longs flow.`
      );
    }
  };

  const handleSelectFormat = (format: PostFormatType) => {
    setPostFormat(format);
    setCurrentStep('upload_content');
  };

  const handleVideoFileSelect = async (file: File) => {
    setVideoFile(file);
    setVideoFileName(file.name);
    setVideoFileSize(formatFileSize(file.size));
    const previewBlobUrl = URL.createObjectURL(file);
    setVideoPreviewUrl(previewBlobUrl);

    // Auto-capture thumbnail frame from the video immediately
    try {
      const frameResult = await captureVideoFrame(file, 1.0);
      if (frameResult?.thumbnailDataUrl) {
        setAutoThumbnail(frameResult.thumbnailDataUrl);
        setSelectedThumbnail(frameResult.thumbnailDataUrl);
      }
    } catch (err) {
      console.warn('Frame capture notice:', err);
    }

    // Upload to Firebase Cloud Storage (or resilient fallback)
    setIsUploading(true);
    setUploadProgress(15);
    setUploadStatusText('Uploading video...');

    try {
      const res = await uploadMediaFile(
        file,
        currentUser?.id || 'creator',
        currentUser?.handle || currentUser?.username || 'buvaki_user',
        'video',
        file.name,
        (progress) => {
          setUploadProgress(Math.round(progress));
        }
      );

      if (res.success && res.url) {
        setUploadedVideoUrl(res.url);
        setUploadedMediaId(res.mediaId || null);
        setUploadProgress(100);
        setUploadStatusText('Video saved');
      }
    } catch (err) {
      console.warn('Upload error:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleUploadCustomThumbnail = async (file: File) => {
    try {
      const dataUrl = await processImageFile(file, 1280, 0.85);
      setCustomThumbnail(dataUrl);
      setSelectedThumbnail(dataUrl);
    } catch (err) {
      console.warn('Custom thumbnail error:', err);
    }
  };

  const handleImageFilesSelect = async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const newPreviews: string[] = [];
    for (const f of fileArray) {
      try {
        const dataUrl = await processImageFile(f, 1920, 0.85);
        newPreviews.push(dataUrl);
      } catch (err) {
        console.warn('Image processing error:', err);
      }
    }
    setImagePreviews((prev) => [...prev, ...newPreviews]);
  };

  const handleRemoveImage = (index: number) => {
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUploadProceed = () => {
    if (postFormat === 'video') {
      setCurrentStep('thumbnail_select');
    } else {
      // Sync text/content if writing discussion
      if (postFormat === 'text' && !content) {
        setContent(textContent);
      }
      setCurrentStep('post_details');
    }
  };

  const handleSavePost = async () => {
    if (!title.trim()) return;

    setIsSaving(true);
    try {
      const chosenSub = subBuvakis.find((s) => s.id === subId) || subBuvakis[0];

      const postData: Partial<Post> = {
        subBuvakiId: subId,
        subBuvakiName: chosenSub?.displayName || 'b/general',
        title: title.trim(),
        content: (content || textContent).trim(),
        authorId: currentUser?.id,
        flair: flair.trim() || 'Discussion',
        tags: tags.length > 0 ? tags : ['#Buvaki'],
        type: postFormat,
        isShort: false,
        isLong: false,
      };

      if (postFormat === 'video') {
        postData.videoUrl =
          uploadedVideoUrl || videoUrlInput || videoPreviewUrl || undefined;
        postData.mediaId = uploadedMediaId || undefined;
        postData.imageUrl = selectedThumbnail || autoThumbnail || undefined;
      } else if (postFormat === 'image') {
        postData.imageUrl = imagePreviews[0] || imageUrlInput || undefined;
        postData.images = imagePreviews.length > 0 ? imagePreviews : undefined;
      } else if (postFormat === 'link') {
        postData.linkUrl = linkUrl.trim() || undefined;
      } else if (postFormat === 'poll') {
        postData.poll = {
          question: pollQuestion.trim() || title.trim(),
          options: pollOptions
            .filter((opt) => opt.trim().length > 0)
            .map((opt, i) => ({
              id: `opt_${Date.now()}_${i}`,
              text: opt.trim(),
              votes: 0,
            })),
          totalVotes: 0,
        };
      }

      onSubmitPost(postData);
      onClose();
    } catch (err) {
      console.error('Failed to publish post:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Notice Dialog if Shorts / Longs clicked */}
      {comingSoonNotice && (
        <div className="fixed inset-0 z-60 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl flex flex-col gap-3 text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
              <Sparkles className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-slate-900">Posts First</h4>
            <p className="text-xs text-slate-600 leading-relaxed">{comingSoonNotice}</p>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setComingSoonNotice(null);
                  setCurrentStep('post_format_select');
                }}
                className="flex-1 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 cursor-pointer"
              >
                Create with Posts
              </button>
              <button
                type="button"
                onClick={() => setComingSoonNotice(null)}
                className="px-3 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200 cursor-pointer"
              >
                Back
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Procedural Step Cards */}
      <AnimatePresence mode="wait">
        {currentStep === 'section_select' && (
          <SectionSelectCard
            key="section_select"
            onSelectSection={handleSelectSection}
            onClose={onClose}
          />
        )}

        {currentStep === 'post_format_select' && (
          <PostFormatCard
            key="post_format_select"
            onSelectFormat={handleSelectFormat}
            onBack={() => setCurrentStep('section_select')}
            onClose={onClose}
          />
        )}

        {currentStep === 'upload_content' && (
          <UploadContentCard
            key="upload_content"
            format={postFormat}
            onBack={() => setCurrentStep('post_format_select')}
            onClose={onClose}
            onProceed={handleUploadProceed}
            videoFile={videoFile}
            videoPreviewUrl={videoPreviewUrl}
            videoFileName={videoFileName}
            videoFileSize={videoFileSize}
            videoUrlInput={videoUrlInput}
            setVideoUrlInput={setVideoUrlInput}
            onVideoFileSelect={handleVideoFileSelect}
            isUploading={isUploading}
            uploadProgress={uploadProgress}
            uploadStatusText={uploadStatusText}
            imagePreviews={imagePreviews}
            onImageFilesSelect={handleImageFilesSelect}
            onRemoveImage={handleRemoveImage}
            imageUrlInput={imageUrlInput}
            setImageUrlInput={setImageUrlInput}
            textContent={textContent}
            setTextContent={setTextContent}
            linkUrl={linkUrl}
            setLinkUrl={setLinkUrl}
            pollQuestion={pollQuestion}
            setPollQuestion={setPollQuestion}
            pollOptions={pollOptions}
            setPollOptions={setPollOptions}
          />
        )}

        {currentStep === 'thumbnail_select' && (
          <ThumbnailCard
            key="thumbnail_select"
            autoThumbnailUrl={autoThumbnail}
            customThumbnailUrl={customThumbnail}
            selectedThumbnailUrl={selectedThumbnail}
            onSelectThumbnail={(url) => setSelectedThumbnail(url)}
            onUploadCustomThumbnail={handleUploadCustomThumbnail}
            onBack={() => setCurrentStep('upload_content')}
            onClose={onClose}
            onProceed={() => setCurrentStep('post_details')}
          />
        )}

        {currentStep === 'post_details' && (
          <PostDetailsCard
            key="post_details"
            subBuvakis={subBuvakis}
            selectedSubId={subId}
            onSelectSubId={setSubId}
            title={title}
            setTitle={setTitle}
            content={content}
            setContent={setContent}
            flair={flair}
            setFlair={setFlair}
            tags={tags}
            setTags={setTags}
            postFormat={postFormat}
            thumbnailPreview={selectedThumbnail || autoThumbnail}
            isSaving={isSaving}
            uploadProgress={uploadProgress}
            uploadStatusText={uploadStatusText}
            onBack={() =>
              setCurrentStep(postFormat === 'video' ? 'thumbnail_select' : 'upload_content')
            }
            onClose={onClose}
            onSave={handleSavePost}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
