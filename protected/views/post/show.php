<div class="beta-content beta-post-show beta-radius3px">
    <div class="beta-post-detail">
        <h1><?php echo $post->title;?></h1>
        <div class="post-extra"><span><?php echo t('post_extra_text', 'main', $post->postExtra);?></span></div>
        <div class="post-content"><?php echo $post->content;?></div>
        <?php if ($post->tags):?>
        <div class="post-tags row">
            <div class="span1"><span class="label success">&nbsp;&nbsp;<?php echo t('tag_label');?>&nbsp;&nbsp;</span></div>
            <div class="span8"><?php echo $post->tagLinks;?></div>
        </div>
        <?php endif;?>
        <?php if ($post->source):?>
        <div class="post-source row">
            <div class="span1"><span class="label success">&nbsp;&nbsp;<?php echo t('source_label');?>&nbsp;&nbsp;</span></div>
            <div class="span8"><?php echo $post->sourceLink;?></div>
        </div>
        <?php endif;?>
    </div>
    <div class="beta-mini-title"><?php echo t('post_comment');?></div>
    <div class="beta-post-form">
        the form
    </div>
    <?php $this->renderPartial('/comment/list', array('comments'=>$comments));?>
</div>
<div class="beta-sidebar">
    <div class="beta-sidebar-block beta-hot-comment beta-radius3px">
        <?php $this->renderPartial('/comment/_hot_list', array('comments'=>$hotComments));?>
    </div>
    <?php $this->widget('BetaLatestPosts', array('title'=>t('relate_posts'), 'tid'=>$post->topic_id));?>
</div>
<div class="clear"></div>